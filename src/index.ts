import express from 'express';
import { createServer } from 'http';
import { Server, WebSocket } from 'ws';
import { Game } from './game';

const app = express();
const server = createServer(app);
const wss = new Server({ server });

const game = new Game(4);

app.get('/', (req, res) => {
  res.send('WebSocket Board Game Server is running');
});

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    if (data.action === 'rollDice') {
      const diceRoll = game.rollDice();
      ws.send(JSON.stringify({ action: 'diceRoll', value: diceRoll }));
    }

    if (data.action === 'movePiece') {
      const currentPlayerId = game.getCurrentPlayer().id;
      const result = game.movePiece(
        currentPlayerId,
        data.pieceId,
        data.diceRoll,
      );

      ws.send(JSON.stringify({ action: 'moveResult', message: result }));

      // 현재 말의 위치 업데이트
      const currentPiece = game.players[currentPlayerId].pieces[data.pieceId];
      const piecePosition = game.convertPositionToCoordinates(
        currentPiece.position,
      );

      // 클라이언트에게 말 위치 업데이트 메시지 전송
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              action: 'updatePiecePosition',
              playerId: currentPlayerId,
              pieceId: data.pieceId,
              position: piecePosition,
            }),
          );
        }
      });

      // 게임 상태 업데이트 및 턴 넘김
      game.nextTurn();

      const gameState = game.players.map((player) => ({
        플레이어: `플레이어 ${player.id + 1}`,
        '말의 위치': player.pieces.map(
          (piece) =>
            `말 ${piece.id + 1}: ${
              piece.position === 0
                ? '시작 지점'
                : piece.position === -1
                ? '도착'
                : piece.position
            }`,
        ),
        '추가 턴': player.hasExtraTurn ? '있음' : '없음',
      }));

      ws.send(
        JSON.stringify({
          action: 'updateState',
          gameState: gameState,
          현재_턴: `플레이어 ${game.getCurrentPlayer().id + 1}`,
        }),
      );
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

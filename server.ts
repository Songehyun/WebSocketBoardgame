import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import { createClient } from 'redis'; // Redis 클라이언트 불러오기

type Player = { id: WebSocket; playerId: number };

type Rooms = {
  [key: string]: {
    players: Player[];
    maxPlayers: number;
    currentTurnPlayerId: number;
  };
};

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static('public'));
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5501', credentials: true }));

let rooms: Rooms = {
  room1: { players: [], maxPlayers: 4, currentTurnPlayerId: 1 },
  room2: { players: [], maxPlayers: 4, currentTurnPlayerId: 1 },
};

// Redis 클라이언트 설정
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

// WebSocket 연결 관리
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'diceRoll') {
      // 모든 클라이언트에게 주사위 굴림 결과와 게임 상태를 전송
      broadcastToAllClients(
        JSON.stringify({
          type: 'diceRoll',
          roll: data.roll,
          gameState: data.gameState,
        }),
      );
    }

    // currentPlayer 상태 업데이트
    if (data.type === 'updateCurrentPlayer') {
      rooms.room1.currentTurnPlayerId = data.currentPlayer;
      broadcastToAllClients(
        JSON.stringify({
          type: 'updateCurrentPlayer',
          currentPlayer: data.currentPlayer,
        }),
      );
    }
  });
});

function broadcastToAllClients(message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// 게임 상태 저장 API
app.post('/save-game', async (req, res) => {
  const gameState = req.body;
  await redisClient.set('gameState', JSON.stringify(gameState));
  res.send('Game state saved');
});

// 게임 상태 불러오기 API
app.get('/load-game', async (req, res) => {
  const gameState = await redisClient.get('gameState');
  if (gameState) {
    res.json(JSON.parse(gameState));
  } else {
    res.json({});
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import { createClient } from 'redis'; // Redis 클라이언트 불러오기

type Player = { id: WebSocket; playerId: number };

type Rooms = {
  [key: string]: {
    players: (Player | null)[]; // null 값으로 빈 자리를 관리
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
  room1: {
    players: [null, null, null, null],
    maxPlayers: 4,
    currentTurnPlayerId: 1,
  },
  room2: {
    players: [null, null, null, null],
    maxPlayers: 4,
    currentTurnPlayerId: 1,
  },
};

// Redis 클라이언트 설정
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

// 방 상태를 모든 클라이언트에게 브로드캐스트하는 함수
function broadcastRoomStates() {
  const roomState = {
    type: 'roomState',
    rooms: Object.keys(rooms).map((roomId) => ({
      roomId,
      players: rooms[roomId].players.filter((player) => player !== null).length,
      maxPlayers: rooms[roomId].maxPlayers,
    })),
  };

  broadcastToAllClients(JSON.stringify(roomState));
}

// 새로운 플레이어가 입장할 때 빈 자리를 찾아 배정
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'join') {
      const room = rooms[data.roomId];
      const emptySlotIndex = room.players.findIndex(
        (player) => player === null,
      );

      if (emptySlotIndex !== -1) {
        const newPlayerId = emptySlotIndex + 1;
        room.players[emptySlotIndex] = { id: ws, playerId: newPlayerId };

        ws.send(JSON.stringify({ type: 'joined', playerId: newPlayerId }));

        // 새로운 플레이어가 입장하면 방 상태 브로드캐스트
        broadcastRoomStates();
      } else {
        ws.send(JSON.stringify({ type: 'roomFull' }));
      }
    }

    if (data.type === 'leave') {
      // 플레이어가 방을 떠날 때 해당 자리를 null로 만듦
      const room = rooms[data.roomId];
      room.players = room.players.map((player) =>
        player?.id === ws ? null : player,
      );

      // 방 상태 업데이트 브로드캐스트
      broadcastRoomStates();
    }

    if (data.type === 'diceRoll') {
      broadcastToAllClients(
        JSON.stringify({
          type: 'diceRoll',
          roll: data.roll,
          gameState: data.gameState,
        }),
      );
    }

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

  // 연결이 끊겼을 때 처리
  ws.on('close', () => {
    // 연결이 끊어진 플레이어를 방에서 제거
    Object.keys(rooms).forEach((roomId) => {
      rooms[roomId].players = rooms[roomId].players.map((player) =>
        player?.id === ws ? null : player,
      );
    });

    // 방 상태 업데이트 브로드캐스트
    broadcastRoomStates();
  });
});

// 모든 클라이언트에 메시지 전송하는 함수
function broadcastToAllClients(message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// 주기적으로 방 상태를 전송 (예: 5초마다)
setInterval(() => {
  broadcastRoomStates();
}, 5000);

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

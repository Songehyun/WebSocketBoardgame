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
app.use(express.json()); // JSON 요청을 처리하기 위해 추가
app.use(cors({ origin: 'http://127.0.0.1:5501', credentials: true })); // CORS 허용 설정 추가

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
  let roomId: string | undefined;

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log('받은 메시지:', data);

    if (data.type === 'join') {
      roomId = data.roomId;
      console.log(`플레이어가 ${roomId}에 입장 시도`);

      if (roomId && rooms[roomId]) {
        if (rooms[roomId].players.length < rooms[roomId].maxPlayers) {
          const playerId = rooms[roomId].players.length + 1;
          rooms[roomId].players.push({ id: ws, playerId });
          ws.send(JSON.stringify({ type: 'joined', playerId }));
          console.log(`Player ${playerId}가 ${roomId}에 입장함`);

          updateRoomState(); // 방 상태 업데이트
        } else {
          ws.send(JSON.stringify({ type: 'roomFull' }));
        }
      }
    }
  });

  ws.on('close', () => {
    if (roomId && rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter((p) => p.id !== ws);
      console.log(`Player가 ${roomId}에서 퇴장함`);
      updateRoomState(); // 방 상태 업데이트
    }
  });
});

// 방 상태를 주기적으로 클라이언트에 전송하는 함수
function updateRoomState() {
  const roomState = {
    type: 'roomState',
    room1: {
      players: rooms.room1.players.length,
      maxPlayers: rooms.room1.maxPlayers,
    },
    room2: {
      players: rooms.room2.players.length,
      maxPlayers: rooms.room2.maxPlayers,
    },
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(roomState));
    }
  });
}

// 게임 상태 저장 API
app.post('/save-game', async (req, res) => {
  const gameState = req.body; // 클라이언트에서 전달된 게임 상태
  await redisClient.set('gameState', JSON.stringify(gameState)); // Redis에 저장
  res.send('Game state saved');
});

// 게임 상태 불러오기 API
app.get('/load-game', async (req, res) => {
  const gameState = await redisClient.get('gameState'); // Redis에서 불러오기
  if (gameState) {
    res.json(JSON.parse(gameState));
  } else {
    res.json({}); // 저장된 게임 상태가 없을 경우 빈 객체 반환
  }
});

// 특정 방의 모든 클라이언트에게 메시지 전송 함수
function broadcastToRoom(roomId: string, message: string) {
  if (rooms[roomId]) {
    rooms[roomId].players.forEach((player) => {
      player.id.send(message);
    });
  }
}

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from 'express';
import { createServer } from 'http';
import { Server } from 'ws';

const app = express();
const server = createServer(app);
const wss = new Server({ server });

app.get('/', (req, res) => {
  res.send('WebSocket Board Game Server is running');
});

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    // 모든 연결된 클라이언트에게 메시지 브로드캐스트
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(`Broadcast: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

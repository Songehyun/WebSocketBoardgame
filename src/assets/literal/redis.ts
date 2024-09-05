import { createClient } from 'redis';

// Redis 클라이언트 생성
const client = createClient();

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

// Redis 서버에 연결
client.connect();

export { client };

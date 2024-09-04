export class WebSocketHandler {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.isConnected = false;

    this.setupHandlers();
  }

  setupHandlers() {
    this.socket.onopen = () => {
      console.log('WebSocket 연결이 열렸습니다.');
      this.isConnected = true;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket 오류 발생:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket 연결이 닫혔습니다.');
      this.isConnected = false;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('서버로부터 받은 메시지:', data);
      // 메시지 처리 로직
    };
  }

  async sendMessage(message) {
    if (!this.isConnected) {
      await new Promise((resolve) => {
        this.socket.onopen = () => {
          resolve();
        };
      });
    }
    this.socket.send(JSON.stringify(message));
  }
}

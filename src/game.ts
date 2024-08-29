interface Piece {
  id: number;
  position: number; // 현재 위치 (0은 시작 지점, -1은 도착)
  playerId: number; // 말의 소유자
}

interface Player {
  id: number;
  pieces: Piece[];
  hasExtraTurn: boolean;
}

class Game {
  players: Player[];
  currentPlayerIndex: number;

  constructor(playerCount: number) {
    this.players = [];
    this.currentPlayerIndex = 0;

    // 각 플레이어와 4개의 말 초기화
    for (let i = 0; i < playerCount; i++) {
      const player: Player = {
        id: i,
        pieces: [
          { id: 0, position: 0, playerId: i },
          { id: 1, position: 0, playerId: i },
          { id: 2, position: 0, playerId: i },
          { id: 3, position: 0, playerId: i },
        ],
        hasExtraTurn: false,
      };
      this.players.push(player);
    }
  }

  rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  movePiece(playerId: number, pieceId: number, diceRoll: number): string {
    const player = this.players[playerId];
    const piece = player.pieces.find((p) => p.id === pieceId);

    if (!piece) {
      return 'Invalid piece';
    }

    // 이동할 수 있는지 확인
    if (piece.position + diceRoll > 20) {
      return 'Cannot move piece';
    }

    // 말 이동
    piece.position += diceRoll;

    // 상대 말을 잡는 경우
    this.players.forEach((p) => {
      if (p.id !== playerId) {
        p.pieces.forEach((opponentPiece) => {
          if (opponentPiece.position === piece.position) {
            opponentPiece.position = 0; // 상대 말을 시작점으로 이동
            player.hasExtraTurn = true; // 추가 턴 부여
          }
        });
      }
    });

    return `플레이어 ${playerId + 1}번이 ${
      pieceId + 1
    }번 말을 ${diceRoll}칸 이동했습니다.`;
  }

  nextTurn(): void {
    if (!this.players[this.currentPlayerIndex].hasExtraTurn) {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.players.length;
    } else {
      this.players[this.currentPlayerIndex].hasExtraTurn = false;
    }
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }
}

export { Game, Player, Piece };

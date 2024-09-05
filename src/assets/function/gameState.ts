// src/assets/function/gameState.ts
export function saveGameState(
  currentPlayer: number,
  currentPlayerRect: number | null,
  extraRoll: boolean,
): void {
  const gameState = {
    currentPlayer,
    currentPlayerRect,
    extraRoll,
    pieces: {} as {
      [key: string]: { parentId: string; playCount: string | null };
    },
  };

  // 게임 말 상태를 저장
  document.querySelectorAll('.piece').forEach((piece) => {
    const pieceId = piece.classList[1];
    const parentId = piece.parentElement!.id;
    const playCount = piece.getAttribute('data-playcount');
    gameState.pieces[pieceId] = { parentId, playCount };
  });

  // API 호출을 통해 서버에 게임 상태 저장
  saveGameStateToServer(gameState);
}

export async function loadGameState(): Promise<{
  currentPlayer: number;
  currentPlayerRect: number | null;
  extraRoll: boolean;
  pieces: { [key: string]: { parentId: string; playCount: string } };
} | null> {
  // API 호출을 통해 서버에서 게임 상태 불러오기 (절대 경로로 수정)
  const response = await fetch('http://127.0.0.1:8080/load-game'); // 절대 경로 사용
  const gameState = await response.json();

  // 게임 상태가 null 또는 undefined일 경우 처리
  if (gameState && gameState.pieces) {
    return gameState;
  } else {
    console.error('게임 상태가 올바르지 않음:', gameState);
    return null; // 게임 상태가 없을 경우 null 반환
  }
}

async function saveGameStateToServer(gameState: any) {
  // API 호출을 통해 서버에 게임 상태 저장 (절대 경로로 수정)
  await fetch('http://127.0.0.1:8080/save-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameState),
  });
}

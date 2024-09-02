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

  document.querySelectorAll('.piece').forEach((piece) => {
    const pieceId = piece.classList[1];
    const parentId = piece.parentElement!.id;
    const playCount = piece.getAttribute('data-playcount');
    gameState.pieces[pieceId] = { parentId, playCount };
  });

  localStorage.setItem('gameState', JSON.stringify(gameState));
}

export function loadGameState(): {
  currentPlayer: number;
  currentPlayerRect: number | null;
  extraRoll: boolean;
  pieces: { [key: string]: { parentId: string; playCount: string } };
} | null {
  const savedGameState = localStorage.getItem('gameState');
  if (savedGameState) {
    const gameState = JSON.parse(savedGameState) as {
      currentPlayer: number;
      currentPlayerRect: number | null;
      extraRoll: boolean;
      pieces: { [key: string]: { parentId: string; playCount: string } };
    };
    return gameState;
  }
  return null;
}

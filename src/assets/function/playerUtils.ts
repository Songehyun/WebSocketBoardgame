// playerUtils.ts (새 파일)
export function updateCurrentPlayerDisplay(currentPlayer: number) {
  const currentPlayerDisplay = document.getElementById(
    'current-player-display',
  ) as HTMLParagraphElement;
  currentPlayerDisplay.textContent = `Player ${currentPlayer}의 턴입니다.`;
}

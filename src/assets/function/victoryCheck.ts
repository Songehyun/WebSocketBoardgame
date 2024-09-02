// victoryCheck.ts (새 파일)
export function checkVictory(
  player: number,
  playerDestinations: { [key: number]: string[] },
  resetGame: () => void,
) {
  const destinations = playerDestinations[player];

  const allFilled = destinations.every((destId) => {
    const dest = document.getElementById(destId);
    return dest?.childElementCount !== undefined && dest.childElementCount > 0;
  });

  if (allFilled) {
    alert(`Player ${player} 승리!`);
    resetGame();
  }
}

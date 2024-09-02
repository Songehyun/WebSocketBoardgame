// moveToNest.ts
import { saveGameState } from './gameState';

export function moveToNest(
  player: number,
  piece: HTMLElement,
  currentPlayer: number,
  currentPlayerRect: number | null,
  extraRoll: boolean,
) {
  const nest = document.getElementById(`player${player}-nest`) as HTMLElement;
  const pieceClasses = piece.classList;
  const lastClass = pieceClasses[pieceClasses.length - 1];
  const pieceNumber = lastClass.match(/\d+$/)![0];

  const selector = `#player${player}-piece-place${pieceNumber}`;
  const nestPosition = nest.querySelector(selector) as HTMLElement;

  if (nestPosition) {
    nestPosition.appendChild(piece);
  }
  piece.setAttribute('data-playcount', '0');

  console.log(`Player ${player}'s piece ${pieceNumber} moved to nest`);

  saveGameState(currentPlayer, currentPlayerRect, extraRoll);
}

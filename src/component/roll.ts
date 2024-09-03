import { saveGameState, loadGameState } from '../assets/function/gameState';
import { playerPositions } from '../assets/literal/playerPositions';
import { playerDestinations } from '../assets/literal/playerDestinations';
import { playerThresholds } from '../assets/literal/playerThresholds'; // 새로 추가된 부분
import { highlightMovablePieces } from '../assets/function/highlightMovablePieces';
import { updateCurrentPlayerDisplay } from '../assets/function/playerUtils';

document.addEventListener('DOMContentLoaded', () => {
  const rollButton = document.getElementById('roll-dice') as HTMLButtonElement;
  const currentPlayerDisplay = document.getElementById(
    'current-player-display',
  ) as HTMLParagraphElement;
  let currentPlayer: number = 1;
  const totalPlayers: number = 4;
  let currentPlayerPiece: HTMLElement | null = null;
  let currentPlayerRect: number | null = null;
  let extraRoll: boolean = false;

  // 게임 상태 로드
  const gameState = loadGameState();
  if (gameState) {
    currentPlayer = gameState.currentPlayer || 1;
    currentPlayerRect = gameState.currentPlayerRect || null;
    extraRoll = gameState.extraRoll || false;

    Object.keys(gameState.pieces).forEach((pieceId) => {
      const { parentId, playCount } = gameState.pieces[pieceId];
      const piece = document.querySelector(`.${pieceId}`) as HTMLElement;
      const parentElement = document.getElementById(parentId);
      parentElement?.appendChild(piece);
      piece.setAttribute('data-playcount', playCount);
    });
    updateCurrentPlayerDisplay(currentPlayer);
  }

  rollButton.addEventListener('click', () => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const diceResultImg = document.getElementById(
      'dice-result',
    ) as HTMLImageElement;
    diceResultImg.src = `../assets/img/${diceRoll}.png`;

    if (!currentPlayerPiece) {
      return;
    }

    if (currentPlayerRect === null) {
      moveToStartPosition(currentPlayer, currentPlayerPiece, diceRoll);
    } else {
      movePlayer(currentPlayer, diceRoll);
    }

    if (!extraRoll) {
      currentPlayer = (currentPlayer % totalPlayers) + 1;
    }
    extraRoll = false;
    currentPlayerPiece = null;

    updateCurrentPlayerDisplay(currentPlayer);
    saveGameState(currentPlayer, currentPlayerRect, extraRoll);
    highlightMovablePieces(currentPlayer);
  });

  document.querySelectorAll('.piece').forEach((piece) => {
    piece.setAttribute('data-playcount', '0');
    piece.addEventListener('click', () => {
      const piecePlayer = parseInt(
        piece.classList[1]?.match(/\d/)?.[0] ?? '0',
        10,
      );
      if (piecePlayer !== currentPlayer) {
        return;
      }

      currentPlayerPiece = piece as HTMLElement;

      const isInNest = piece.closest('.nest');
      currentPlayerRect = isInNest
        ? null
        : parseInt(piece.parentElement!.id.replace('rect', ''), 10);
    });
  });

  function moveToStartPosition(
    player: number,
    piece: HTMLElement,
    roll: number,
  ) {
    let startRectId = playerPositions[player];
    let startRectNumber = parseInt(startRectId.replace('rect', ''), 10);
    const pieceNumber = piece.classList[1].match(/\d+$/)![0];

    startRectNumber += roll - 1;

    if (startRectNumber > 48) {
      startRectNumber = startRectNumber - 48;
      piece.setAttribute('data-playcount', '1');
    }

    const startRect = document.getElementById(
      `rect${startRectNumber}`,
    ) as HTMLElement;

    if (startRect.childElementCount > 0) {
      const occupyingPlayer = (
        startRect.firstChild as HTMLElement
      )?.getAttribute('data-player');
      if (occupyingPlayer !== String(player)) {
        moveToNest(
          parseInt(occupyingPlayer!, 10),
          startRect.firstChild as HTMLElement,
        );
        extraRoll = true;
      }
    }

    startRect.appendChild(piece);
    currentPlayerRect = startRectNumber;

    console.log(
      `Player ${player}'s piece ${pieceNumber} moved to ${startRect.id}`,
    );

    saveGameState(currentPlayer, currentPlayerRect, extraRoll);
  }

  function movePlayer(player: number, roll: number) {
    const pieceNumber = currentPlayerPiece!.classList[1].match(/\d+$/)![0];
    const initialRect = currentPlayerRect!;
    let finalPosition = currentPlayerRect! + roll;
    const piecePlayCount = parseInt(
      currentPlayerPiece!.getAttribute('data-playcount') || '0',
      10,
    );
    const threshold = playerThresholds[player];

    if (initialRect < 48 && finalPosition > 48) {
      if (player !== 1) {
        currentPlayerPiece!.setAttribute('data-playcount', '1');
      }
      finalPosition -= 48;
    }

    if (player === 1) {
      if (initialRect < 47 && finalPosition >= 47) {
        moveToDestination(player, finalPosition - 47);
      } else {
        movePieceToNewRect(finalPosition, player, pieceNumber, initialRect);
      }
    } else {
      if (piecePlayCount === 1 && finalPosition > threshold) {
        moveToDestination(player, finalPosition - threshold);
      } else {
        movePieceToNewRect(finalPosition, player, pieceNumber, initialRect);
      }
    }

    currentPlayerRect = finalPosition;
    saveGameState(currentPlayer, currentPlayerRect, extraRoll);
  }

  function moveToDestination(player: number, steps: number) {
    const destinations = playerDestinations[player];
    if (steps > destinations.length) {
      return;
    }

    const destination = document.getElementById(
      destinations[steps - 1],
    ) as HTMLElement;
    if (destination.childElementCount === 0) {
      destination.appendChild(currentPlayerPiece!);
      console.log(`Player ${player}'s piece moved to ${destination.id}`);
      checkVictory(player);
    }
  }

  function movePieceToNewRect(
    position: number,
    player: number,
    pieceNumber: string,
    initialRect: number,
  ) {
    const newRect = document.getElementById(`rect${position}`) as HTMLElement;

    if (newRect.childElementCount > 0) {
      const firstChildPlayer = (
        newRect.firstChild as HTMLElement
      )?.getAttribute('data-player');
      if (firstChildPlayer !== String(player)) {
        moveToNest(
          parseInt(firstChildPlayer!, 10),
          newRect.firstChild as HTMLElement,
        );
        extraRoll = true;
      }
    }

    newRect.appendChild(currentPlayerPiece!);
    console.log(
      `Player ${player}'s piece ${pieceNumber} moved from rect${initialRect} to ${newRect.id}`,
    );

    if (player !== 1 && initialRect <= 48 && position > 48) {
      currentPlayerPiece!.setAttribute('data-playcount', '1');
    }
  }

  function moveToNest(player: number, piece: HTMLElement) {
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

  function checkVictory(player: number) {
    const destinations = playerDestinations[player];

    const allFilled = destinations.every((destId) => {
      const dest = document.getElementById(destId);
      return (
        dest?.childElementCount !== undefined && dest.childElementCount > 0
      );
    });

    if (allFilled) {
      alert(`Player ${player} 승리!`);
      resetGame();
    }
  }

  function resetGame() {
    document.querySelectorAll('.piece').forEach((piece) => {
      const player = parseInt(piece.classList[1]?.match(/\d/)?.[0] ?? '0', 10);
      const pieceNumber = piece.classList[1].match(/\d+$/)![0];
      const nest = document.getElementById(
        `player${player}-piece-place${pieceNumber}`,
      ) as HTMLElement;
      nest.appendChild(piece);
      piece.setAttribute('data-playcount', '0');
    });

    currentPlayer = 1;
    currentPlayerPiece = null;
    extraRoll = false;

    localStorage.removeItem('gameState');

    alert('게임이 리셋되었습니다. Player 1의 차례입니다.');
    highlightMovablePieces(currentPlayer);
    updateCurrentPlayerDisplay(currentPlayer);
  }

  highlightMovablePieces(currentPlayer);
  updateCurrentPlayerDisplay(currentPlayer);
});

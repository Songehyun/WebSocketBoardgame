import automateTurn from './sortMacro'; // automateTurn 함수가 위치한 경로를 지정하세요.

document.addEventListener('DOMContentLoaded', () => {
  const rollButton = document.getElementById('roll-dice') as HTMLButtonElement;
  const automateButton = document.getElementById('automate-turn') as HTMLButtonElement;
  let currentPlayer: number = 1;
  const totalPlayers: number = 4;
  let currentPlayerPiece: HTMLElement | null = null;
  let currentPlayerRect: number | null = null;
  let playCount: number[] = [0, 0, 0, 0]; // 각 플레이어의 playcount
  let extraRoll: boolean = false; // 주사위를 다시 굴릴 수 있는지 여부를 나타내는 플래그
  let automationInterval: NodeJS.Timeout | null = null;

  const playerPositions: { [key: number]: string } = {
    1: 'rect1',
    2: 'rect13',
    3: 'rect25',
    4: 'rect37',
  };

  const playerDestinations: { [key: number]: string[] } = {
    1: ['player1-dest1', 'player1-dest2', 'player1-dest3', 'player1-dest4'],
    2: ['player2-dest1', 'player2-dest2', 'player2-dest3', 'player2-dest4'],
    3: ['player3-dest1', 'player3-dest2', 'player3-dest3', 'player3-dest4'],
    4: ['player4-dest1', 'player4-dest2', 'player4-dest3', 'player4-dest4'],
  };

  rollButton.addEventListener('click', () => {
    if (!currentPlayerPiece) {
      console.log('먼저 말을 선택하세요!');
      return;
    }

    const diceRoll: number = Math.floor(Math.random() * 6) + 1;
    console.log(`Player ${currentPlayer} rolled a ${diceRoll}`);

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
  });

  document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', () => {
      const piecePlayer = piece.classList[1].match(/\d/)?.[0];
      if (!piecePlayer) {
        return;
      }
      const playerNum = parseInt(piecePlayer, 10);
      if (playerNum !== currentPlayer) {
        console.log(`Player ${currentPlayer}의 턴입니다.`);
        return;
      }

      currentPlayerPiece = piece as HTMLElement;

      const isInNest = piece.closest('.nest');
      currentPlayerRect = isInNest
        ? null
        : parseInt(piece.parentElement?.id.replace('rect', '') ?? '0', 10);
    });
  });

  function moveToStartPosition(player: number, piece: HTMLElement, roll: number): void {
    let startRectId = playerPositions[player];
    let startRectNumber = parseInt(startRectId.replace('rect', ''), 10);
    startRectNumber += roll - 1;

    if (startRectNumber > 48) {
      startRectNumber = startRectNumber - 48;
      playCount[player - 1] = 1;
    }

    const startRect = document.getElementById(`rect${startRectNumber}`) as HTMLElement;

    if (startRect.childElementCount > 0) {
      const occupyingPlayer = (startRect.firstChild as HTMLElement)?.dataset.player;
      if (occupyingPlayer !== undefined && occupyingPlayer !== String(player)) {
        console.log(`Player ${occupyingPlayer}의 말이 시작 위치에 있습니다.`);
        moveToNest(parseInt(occupyingPlayer, 10), startRect.firstChild as HTMLElement);
      }
    }

    startRect.appendChild(piece);
    currentPlayerRect = startRectNumber;
  }

  function movePlayer(player: number, roll: number): void {
    const nextPosition = (currentPlayerRect ?? 0) + roll;
    const finalPosition = nextPosition > 48 ? nextPosition - 48 : nextPosition;
  
    if (nextPosition > 48) {
      playCount[player - 1] = 1;
    }
  
    const newRect = document.getElementById(`rect${finalPosition}`) as HTMLElement;
  
    if (newRect.childElementCount > 0) {
      const firstChild = newRect.firstChild as HTMLElement | null;
      if (firstChild && firstChild.dataset.player) {
        const firstChildPlayer = firstChild.dataset.player;
        const lastChildPlayer = player;
  
        if (firstChildPlayer === String(lastChildPlayer)) {
          if (currentPlayerPiece) {
            newRect.appendChild(currentPlayerPiece);
          }
        } else {
          Array.from(newRect.children).forEach((child) => {
            if (child !== currentPlayerPiece) {
              const piece = child as HTMLElement;
              const piecePlayer = piece.dataset.player;
              if (piecePlayer) {
                moveToNest(parseInt(piecePlayer, 10), piece);
              }
            }
          });
          if (currentPlayerPiece) {
            newRect.appendChild(currentPlayerPiece);
          }
          console.log(`Player ${lastChildPlayer} rolls again!`);
          extraRoll = true;
          return;
        }
      }
    } else {
      if (currentPlayerPiece) {
        newRect.appendChild(currentPlayerPiece);
      }
    }
  
    currentPlayerRect = finalPosition;
  }

  function moveToNest(player: number, piece: HTMLElement): void {
    const nest = document.getElementById(`player${player}-nest`) as HTMLElement;
    const pieceClasses = piece.classList;
    const lastClass = pieceClasses[pieceClasses.length - 1];
    const pieceNumber = lastClass.match(/\d+$/)?.[0];

    if (!pieceNumber) {
      console.error('Piece number not found');
      return;
    }

    const selector = `#player${player}-piece-place${pieceNumber}`;
    const nestPosition = nest.querySelector(selector) as HTMLElement | null;

    if (nestPosition) {
      nestPosition.appendChild(piece);
    } else {
      console.error('해당 위치에 요소를 찾을 수 없습니다.');
    }
    playCount[player - 1] = 0;
  }

  automateButton.addEventListener('click', () => {
    if (automationInterval) {
      clearInterval(automationInterval);
      automationInterval = null;
      automateButton.textContent = 'Start Automation';
      return;
    }

    automationInterval = setInterval(() => {
      extraRoll = automateTurn(rollButton, currentPlayer, totalPlayers, extraRoll, (player) => {
        currentPlayer = player;
      });
    }, 1000);
    automateButton.textContent = 'Stop Automation';
  });
});

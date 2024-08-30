document.addEventListener('DOMContentLoaded', () => {
  const rollButton = document.getElementById('roll-dice');
  const currentPlayerDisplay = document.getElementById(
    'current-player-display',
  );
  let currentPlayer = 1;
  const totalPlayers = 4;
  let currentPlayerPiece = null;
  let currentPlayerRect = null;
  let extraRoll = false; // 주사위를 다시 굴릴 수 있는지 여부를 나타내는 플래그

  const playerPositions = {
    1: 'rect1',
    2: 'rect13',
    3: 'rect25',
    4: 'rect37',
  };

  const playerDestinations = {
    1: ['player1-dest1', 'player1-dest2', 'player1-dest3', 'player1-dest4'],
    2: ['player2-dest1', 'player2-dest2', 'player2-dest3', 'player2-dest4'],
    3: ['player3-dest1', 'player3-dest2', 'player3-dest3', 'player3-dest4'],
    4: ['player4-dest1', 'player4-dest2', 'player4-dest3', 'player4-dest4'],
  };

  const playerThresholds = {
    1: 47,
    2: 11,
    3: 23,
    4: 35,
  };

  function saveGameState() {
    const gameState = {
      currentPlayer,
      currentPlayerRect,
      extraRoll,
      pieces: {},
    };

    document.querySelectorAll('.piece').forEach((piece) => {
      const pieceId = piece.classList[1];
      const parentId = piece.parentElement.id;
      const playCount = piece.getAttribute('data-playcount');
      gameState.pieces[pieceId] = { parentId, playCount };
    });

    localStorage.setItem('gameState', JSON.stringify(gameState));
  }

  function loadGameState() {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
      const gameState = JSON.parse(savedGameState);
      currentPlayer = gameState.currentPlayer || 1;
      currentPlayerRect = gameState.currentPlayerRect || null;
      extraRoll = gameState.extraRoll || false;

      Object.keys(gameState.pieces).forEach((pieceId) => {
        const { parentId, playCount } = gameState.pieces[pieceId];
        const piece = document.querySelector(`.${pieceId}`);
        const parentElement = document.getElementById(parentId);
        parentElement.appendChild(piece);
        piece.setAttribute('data-playcount', playCount);
      });
      updateCurrentPlayerDisplay(); // 로드 후 플레이어 표시 업데이트
    }
  }

  loadGameState();

  rollButton.addEventListener('click', () => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const diceResultImg = document.getElementById('dice-result');
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

    updateCurrentPlayerDisplay(); // 플레이어 표시 업데이트
    saveGameState();
    highlightMovablePieces(); // 움직일 수 있는 말에 테두리 적용
  });

  function highlightMovablePieces() {
    document.querySelectorAll('.piece').forEach((piece) => {
      const piecePlayer = piece.classList[1].match(/\d/)[0];
      const pieceParent = piece.parentElement;

      if (
        parseInt(piecePlayer) === currentPlayer &&
        !(pieceParent && pieceParent.id.includes('dest'))
      ) {
        piece.style.border = '2px solid black';
      } else {
        piece.style.border = 'none';
      }
    });
  }

  document.querySelectorAll('.piece').forEach((piece) => {
    piece.setAttribute('data-playcount', '0');
    piece.addEventListener('click', () => {
      const piecePlayer = piece.classList[1].match(/\d/)[0];
      if (parseInt(piecePlayer) !== currentPlayer) {
        return;
      }

      currentPlayerPiece = piece;

      const isInNest = piece.closest('.nest');
      currentPlayerRect = isInNest
        ? null
        : parseInt(piece.parentElement.id.replace('rect', ''));
    });
  });

  function moveToStartPosition(player, piece, roll) {
    let startRectId = playerPositions[player];
    let startRectNumber = parseInt(startRectId.replace('rect', ''));

    startRectNumber += roll - 1;

    if (startRectNumber > 48) {
      startRectNumber = startRectNumber - 48;
      piece.setAttribute('data-playcount', '1');
    }

    const startRect = document.getElementById(`rect${startRectNumber}`);

    if (startRect.childElementCount > 0) {
      const occupyingPlayer = startRect.firstChild.dataset.player;
      if (occupyingPlayer !== String(player)) {
        moveToNest(occupyingPlayer, startRect.firstChild);
        extraRoll = true;
      }
    }

    startRect.appendChild(piece);
    currentPlayerRect = startRectNumber;

    checkDestination(player, piece);
    saveGameState();
  }

  function movePlayer(player, roll) {
    const nextPosition = currentPlayerRect + roll;
    const finalPosition = nextPosition > 48 ? nextPosition - 48 : nextPosition;
    const piecePlayCount = currentPlayerPiece.getAttribute('data-playcount');
    const threshold = playerThresholds[player];

    if (nextPosition > 48) {
      currentPlayerPiece.setAttribute('data-playcount', '1');
    }

    if (piecePlayCount === '1' && finalPosition > threshold) {
      const destIndex = finalPosition - threshold - 1;
      const destination = document.getElementById(
        playerDestinations[player][destIndex],
      );

      if (destIndex >= 4) {
        saveGameState();
        return;
      }

      if (destination.childElementCount === 0) {
        destination.appendChild(currentPlayerPiece);
        checkVictory(player);
      }

      saveGameState();
    } else {
      const newRect = document.getElementById(`rect${finalPosition}`);

      if (newRect.childElementCount > 0) {
        const firstChildPlayer = newRect.firstChild.dataset.player;
        const lastChildPlayer = player;

        if (firstChildPlayer === String(lastChildPlayer)) {
          newRect.appendChild(currentPlayerPiece);
        } else {
          Array.from(newRect.children).forEach((child) => {
            if (child !== currentPlayerPiece) {
              const piecePlayer = child.dataset.player;
              const piece = child;
              moveToNest(piecePlayer, piece);
            }
          });
          newRect.appendChild(currentPlayerPiece);
          extraRoll = true;
          saveGameState();
          return;
        }
      } else {
        newRect.appendChild(currentPlayerPiece);
      }

      saveGameState();
    }

    currentPlayerRect = finalPosition;
    checkDestination(player, currentPlayerPiece);
    saveGameState();
  }

  function moveToNest(player, piece) {
    const nest = document.getElementById(`player${player}-nest`);
    const pieceClasses = piece.classList;
    const lastClass = pieceClasses[pieceClasses.length - 1];
    const pieceNumber = lastClass.match(/\d+$/)[0];

    const selector = `#player${player}-piece-place${pieceNumber}`;

    const nestPosition = nest.querySelector(selector);
    if (nestPosition) {
      nestPosition.appendChild(piece);
    }
    piece.setAttribute('data-playcount', '0');

    saveGameState();
  }

  function checkDestination(player, piece) {
    const destinations = playerDestinations[player];
    const piecePlayCount = piece.getAttribute('data-playcount');

    if (
      (player === 1 && currentPlayerRect > 47) ||
      (player === 2 && currentPlayerRect > 11) ||
      (player === 3 && currentPlayerRect > 23) ||
      (player === 4 && currentPlayerRect > 35)
    ) {
      if (player === 1 || piecePlayCount === '1') {
        for (let i = 0; i < destinations.length; i++) {
          const dest = document.getElementById(destinations[i]);
          if (dest.childElementCount === 0) {
            dest.appendChild(piece);
            break;
          }
        }

        checkVictory(player);
      }
    }

    saveGameState();
  }

  function checkVictory(player) {
    const destinations = playerDestinations[player];

    const allFilled = destinations.every((destId) => {
      const dest = document.getElementById(destId);
      return dest.childElementCount > 0;
    });

    if (allFilled) {
      alert(`Player ${player} 승리!`);
      resetGame();
    }
  }

  function resetGame() {
    document.querySelectorAll('.piece').forEach((piece) => {
      const player = piece.classList[1].match(/\d/)[0];
      const pieceNumber = piece.classList[1].match(/\d+$/)[0];
      const nest = document.getElementById(
        `player${player}-piece-place${pieceNumber}`,
      );
      nest.appendChild(piece);
      piece.setAttribute('data-playcount', '0');
    });

    currentPlayer = 1;
    currentPlayerPiece = null;
    currentPlayerRect = null;
    extraRoll = false;

    localStorage.removeItem('gameState');

    alert('게임이 리셋되었습니다. Player 1의 차례입니다.');
    highlightMovablePieces(); // 게임이 리셋된 후에도 테두리 표시
    updateCurrentPlayerDisplay(); // 게임이 리셋된 후 플레이어 표시 업데이트
  }

  function updateCurrentPlayerDisplay() {
    currentPlayerDisplay.textContent = `Player ${currentPlayer}의 턴입니다.`;
  }

  highlightMovablePieces(); // 처음 페이지 로드 시 테두리 표시
  updateCurrentPlayerDisplay(); // 처음 페이지 로드 시 플레이어 표시 업데이트
});

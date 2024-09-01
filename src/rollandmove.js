document.addEventListener('DOMContentLoaded', () => {
  const rollButton = document.getElementById('roll-dice');
  const currentPlayerDisplay = document.getElementById('current-player-display');
  let currentPlayer = 1;
  const totalPlayers = 4;
  let currentPlayerPiece = null;
  let currentPlayerRect = null;
  let extraRoll = false;

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
      updateCurrentPlayerDisplay();
    }
  }

  loadGameState();

  rollButton.addEventListener('click', () => {
    const diceRoll = Math.random() < 0.5 ? 6 : 5;
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

    updateCurrentPlayerDisplay();
    saveGameState();
    highlightMovablePieces();
  });

  function highlightMovablePieces() {
    document.querySelectorAll('.piece').forEach((piece) => {
      const piecePlayer = piece.classList[1].match(/\d/)[0];
      const pieceParent = piece.parentElement;

      if (parseInt(piecePlayer) === currentPlayer && !(pieceParent && pieceParent.id.includes('dest'))) {
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
      currentPlayerRect = isInNest ? null : parseInt(piece.parentElement.id.replace('rect', ''));
    });
  });

  function moveToStartPosition(player, piece, roll) {
    let startRectId = playerPositions[player];
    let startRectNumber = parseInt(startRectId.replace('rect', ''));
    const pieceNumber = piece.classList[1].match(/\d+$/)[0];

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

    console.log(`Player ${player}'s piece ${pieceNumber} moved to ${startRect.id}`);

    saveGameState();
  }

  function movePlayer(player, roll) {
    const pieceNumber = currentPlayerPiece.classList[1].match(/\d+$/)[0];
    const initialRect = currentPlayerRect;
    let finalPosition = currentPlayerRect + roll;
    const piecePlayCount = parseInt(currentPlayerPiece.getAttribute('data-playcount'));
    const threshold = playerThresholds[player];

    if (initialRect < 48 && finalPosition > 48) {
      if (player !== 1) {
        currentPlayerPiece.setAttribute('data-playcount', '1');
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
    saveGameState();
  }

  function moveToDestination(player, steps) {
    const destinations = playerDestinations[player];
    if (steps > destinations.length) {
      // dest를 초과하는 경우 차례 넘김
      return;
    }

    const destination = document.getElementById(destinations[steps - 1]);
    if (destination.childElementCount === 0) {
      destination.appendChild(currentPlayerPiece);
      console.log(`Player ${player}'s piece moved to ${destination.id}`);
      checkVictory(player);
    }
    // dest에 이미 말이 있는 경우 차례 넘김
  }

  function movePieceToNewRect(position, player, pieceNumber, initialRect) {
    const newRect = document.getElementById(`rect${position}`);

    if (newRect.childElementCount > 0) {
      const firstChildPlayer = newRect.firstChild.dataset.player;
      if (firstChildPlayer !== String(player)) {
        moveToNest(firstChildPlayer, newRect.firstChild);
        extraRoll = true;
      }
    }

    newRect.appendChild(currentPlayerPiece);
    console.log(`Player ${player}'s piece ${pieceNumber} moved from rect${initialRect} to ${newRect.id}`);

    // rect48을 지나는 경우 플래그 설정 (player 1 제외)
    if (player !== 1 && initialRect <= 48 && position > 48) {
      currentPlayerPiece.setAttribute('data-playcount', '1');
    }
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

    console.log(`Player ${player}'s piece ${pieceNumber} moved to nest`);

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
      const nest = document.getElementById(`player${player}-piece-place${pieceNumber}`);
      nest.appendChild(piece);
      piece.setAttribute('data-playcount', '0');
    });

    currentPlayer = 1;
    currentPlayerPiece = null;
    extraRoll = false;

    localStorage.removeItem('gameState');

    alert('게임이 리셋되었습니다. Player 1의 차례입니다.');
    highlightMovablePieces();
    updateCurrentPlayerDisplay();
  }

  function updateCurrentPlayerDisplay() {
    currentPlayerDisplay.textContent = `Player ${currentPlayer}의 턴입니다.`;
  }

  highlightMovablePieces();
  updateCurrentPlayerDisplay();
});

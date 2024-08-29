// JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const rollButton = document.getElementById('roll-dice');
  let currentPlayer = 1;
  const totalPlayers = 4;
  let currentPlayerPiece;
  let currentPlayerRect;
  let playCount = [0, 0, 0, 0]; // 각 플레이어의 playcount

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

  rollButton.addEventListener('click', () => {
    if (!currentPlayerPiece) {
      alert('먼저 말을 선택하세요!');
      return;
    }

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    alert(`Player ${currentPlayer} rolled a ${diceRoll}`);

    movePlayer(currentPlayer, diceRoll);
    currentPlayer = (currentPlayer % totalPlayers) + 1; // 다음 플레이어로 전환
    currentPlayerPiece = null; // 턴 종료 후 말 초기화
  });

  document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', () => {
      const piecePlayer = piece.classList[1].match(/\d/)[0]; // 말의 플레이어 번호 추출
      if (parseInt(piecePlayer) !== currentPlayer) {
        alert(`Player ${currentPlayer}의 턴입니다.`);
        return;
      }

      currentPlayerPiece = piece;

      // 만약 선택한 말이 nest에 있으면 첫 번째 rect로 이동
      const isInNest = piece.closest('.nest');
      if (isInNest) {
        currentPlayerRect = parseInt(
          playerPositions[currentPlayer].replace('rect', ''),
        );
        moveToStartPosition(currentPlayer, piece);
      } else {
        currentPlayerRect = parseInt(
          piece.parentElement.id.replace('rect', ''),
        );
      }
    });
  });

  function moveToStartPosition(player, piece) {
    const startRectId = playerPositions[player];
    const startRect = document.getElementById(startRectId);

    // 만약 시작 위치에 다른 플레이어의 말이 있으면 충돌 처리
    if (startRect.childElementCount > 0) {
      const occupyingPlayer = startRect.firstChild.dataset.player;
      if (occupyingPlayer !== String(player)) {
        alert(`Player ${occupyingPlayer}의 말이 시작 위치에 있습니다.`);
        moveToNest(occupyingPlayer, startRect.firstChild);
      }
    }

    // 말 이동
    startRect.appendChild(piece);
    currentPlayerRect = parseInt(startRectId.replace('rect', ''));
  }

  function movePlayer(player, roll) {
    const nextPosition = currentPlayerRect + roll;
    const finalPosition = nextPosition > 48 ? nextPosition - 48 : nextPosition;

    // playcount 증가 조건
    if (nextPosition > 48) {
      playCount[player - 1] = 1;
    }

    const newRect = document.getElementById(`rect${finalPosition}`);

    // 충돌 체크
    if (newRect.childElementCount > 0) {
      const occupyingPlayer = newRect.firstChild.dataset.player;
      if (occupyingPlayer !== String(player)) {
        // 충돌 처리
        alert(
          `Player ${occupyingPlayer}'s piece is sent back to the nest! Player ${player} rolls again.`,
        );
        moveToNest(occupyingPlayer, newRect.firstChild);
        // 주사위 다시 굴리기
        return;
      }
    }

    // 말 이동
    newRect.appendChild(currentPlayerPiece);
    currentPlayerRect = finalPosition;

    // 목적지 체크
    checkDestination(player);
  }

  function moveToNest(player, piece) {
    const nest = document.getElementById(`player${player}-nest`);
    const pieceNumber = piece.classList[1].replace(/[^0-9]/g, '');
    const nestPosition = nest.querySelector(
      `.player${player}-piece${pieceNumber}`,
    );
    nestPosition.appendChild(piece);
    playCount[player - 1] = 0;
  }

  function checkDestination(player) {
    const destinations = playerDestinations[player];

    // 특정 조건에 따라 목적지로 이동
    if (
      (player === 1 && currentPlayerRect > 47) ||
      (player === 2 && currentPlayerRect > 11) ||
      (player === 3 && currentPlayerRect > 23) ||
      (player === 4 && currentPlayerRect > 35)
    ) {
      if (playCount[player - 1] === 1) {
        for (let i = 0; i < destinations.length; i++) {
          const dest = document.getElementById(destinations[i]);
          if (dest.childElementCount === 0) {
            dest.appendChild(currentPlayerPiece);
            break;
          }
        }
      }
    }
  }
});

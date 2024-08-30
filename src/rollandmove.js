document.addEventListener('DOMContentLoaded', () => {
  const rollButton = document.getElementById('roll-dice');
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

  rollButton.addEventListener('click', () => {
    if (!currentPlayerPiece) {
      alert('먼저 말을 선택하세요!');
      return;
    }

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    alert(`Player ${currentPlayer} rolled a ${diceRoll}`);

    // 현재 말이 nest에 있으면, 주사위 값만큼 첫 번째 위치로 이동
    if (currentPlayerRect === null) {
      moveToStartPosition(currentPlayer, currentPlayerPiece, diceRoll);
    } else {
      movePlayer(currentPlayer, diceRoll);
    }

    // 플레이어 전환
    if (!extraRoll) {
      currentPlayer = (currentPlayer % totalPlayers) + 1; // 다음 플레이어로 전환
    }
    extraRoll = false; // 추가 주사위 굴림 플래그 초기화
    currentPlayerPiece = null; // 턴 종료 후 말 초기화
  });

  document.querySelectorAll('.piece').forEach((piece) => {
    piece.setAttribute('data-playcount', '0'); // 각 piece에 초기 playCount를 0으로 설정
    piece.addEventListener('click', () => {
      const piecePlayer = piece.classList[1].match(/\d/)[0]; // 말의 플레이어 번호 추출
      if (parseInt(piecePlayer) !== currentPlayer) {
        alert(`Player ${currentPlayer}의 턴입니다.`);
        return;
      }

      currentPlayerPiece = piece;

      // nest에 있으면 currentPlayerRect를 null로 유지
      const isInNest = piece.closest('.nest');
      currentPlayerRect = isInNest
        ? null
        : parseInt(piece.parentElement.id.replace('rect', ''));
    });
  });

  function moveToStartPosition(player, piece, roll) {
    let startRectId = playerPositions[player];
    let startRectNumber = parseInt(startRectId.replace('rect', ''));

    // 주사위 값만큼 더해 첫 번째 위치부터 이동
    startRectNumber += roll - 1;

    // 범위를 넘어서면 다시 1부터 시작
    if (startRectNumber > 48) {
      startRectNumber = startRectNumber - 48;
      piece.setAttribute('data-playcount', '1'); // piece의 playCount 증가
      console.log(
        `Player ${player}, Piece ${piece.classList[1]}: playCount increased to 1`,
      );
    }

    const startRect = document.getElementById(`rect${startRectNumber}`);

    // 만약 시작 위치에 다른 플레이어의 말이 있으면 충돌 처리
    if (startRect.childElementCount > 0) {
      const occupyingPlayer = startRect.firstChild.dataset.player;
      console.log(occupyingPlayer);
      if (occupyingPlayer !== String(player)) {
        alert(
          `Player ${occupyingPlayer}의 말을 잡았습니다! 추가 턴을 얻습니다.`,
        );
        moveToNest(occupyingPlayer, startRect.firstChild);
        extraRoll = true; // 추가 주사위 굴림 플래그 설정
      }
    }

    // 말 이동
    startRect.appendChild(piece);
    currentPlayerRect = startRectNumber;

    // 목적지 체크
    checkDestination(player, piece);
  }

  function movePlayer(player, roll) {
    const nextPosition = currentPlayerRect + roll;
    const finalPosition = nextPosition > 48 ? nextPosition - 48 : nextPosition;
    const piecePlayCount = currentPlayerPiece.getAttribute('data-playcount');
    const threshold = playerThresholds[player];

    // piece의 playCount 증가 조건
    if (nextPosition > 48) {
      currentPlayerPiece.setAttribute('data-playcount', '1'); // piece의 playCount 증가
      console.log(
        `Player ${player}, Piece ${currentPlayerPiece.classList[1]}: playCount increased to 1`,
      );
    }

    // PlayCount가 1인 경우 목표 위치로 이동
    if (piecePlayCount === '1' && finalPosition > threshold) {
      const destIndex = finalPosition - threshold - 1;
      const destination = document.getElementById(
        playerDestinations[player][destIndex],
      );

      if (destIndex >= 4) {
        alert(`Player ${player} cannot move beyond destination 4. Turn ends.`);
        return; // 주사위 굴림 종료
      }

      // 목적지로 이동
      if (destination.childElementCount === 0) {
        destination.appendChild(currentPlayerPiece);
        alert(`Player ${player} has reached destination ${destIndex + 1}!`);
        console.log(
          `Player ${player}, Piece ${currentPlayerPiece.classList[1]}: has reached the destination`,
        );
      } else {
        alert(`Player ${player}'s piece could not enter the destination.`);
        console.log(
          `Player ${player}, Piece ${currentPlayerPiece.classList[1]}: could not enter the destination`,
        );
      }
    } else {
      const newRect = document.getElementById(`rect${finalPosition}`);

      // 충돌 체크
      if (newRect.childElementCount > 0) {
        const firstChildPlayer = newRect.firstChild.dataset.player;
        const lastChildPlayer = player;
        console.log(firstChildPlayer);
        console.log(lastChildPlayer);

        if (firstChildPlayer === String(lastChildPlayer)) {
          // 두 말이 동일한 플레이어의 것이라면 두 개 모두 유지
          newRect.appendChild(currentPlayerPiece);
        } else {
          // 다른 플레이어의 말이라면, 현재 말만 유지하고 나머지 말을 원래의 nest로 보냄
          Array.from(newRect.children).forEach((child) => {
            if (child !== currentPlayerPiece) {
              const piecePlayer = child.dataset.player;
              const piece = child;
              console.log(piecePlayer);
              console.log(child);
              moveToNest(piecePlayer, piece);
            }
          });
          newRect.appendChild(currentPlayerPiece);
          // 주사위를 한 번 더 굴릴 수 있도록 설정
          alert(`Player ${lastChildPlayer} rolls again!`);
          extraRoll = true; // 추가 주사위 굴림 플래그 설정
          return;
        }
      } else {
        // 말 이동
        newRect.appendChild(currentPlayerPiece);
      }
    }

    currentPlayerRect = finalPosition;

    // 목적지 체크
    checkDestination(player, currentPlayerPiece);
  }

  function moveToNest(player, piece) {
    const nest = document.getElementById(`player${player}-nest`);
    const pieceClasses = piece.classList;
    const lastClass = pieceClasses[pieceClasses.length - 1]; // 마지막 클래스를 가져옴
    const pieceNumber = lastClass.match(/\d+$/)[0]; // 마지막 숫자만 추출

    console.log(piece); // piece 요소 확인
    console.log(pieceNumber); // pieceNumber 확인

    // 셀렉터 문자열 확인
    const selector = `#player${player}-piece-place${pieceNumber}`;
    console.log(selector); // 최종 셀렉터를 출력

    const nestPosition = nest.querySelector(selector); // 정확한 위치에 piece 추가
    if (nestPosition) {
      console.log(nestPosition);
      nestPosition.appendChild(piece); // piece를 nest의 지정된 위치로 이동
      console.log(
        `Player ${player}, Piece ${piece.classList[1]}: moved back to nest and playCount reset to 0`,
      );
    } else {
      console.log('해당 위치에 요소를 찾을 수 없습니다.');
    }
    piece.setAttribute('data-playcount', '0'); // piece의 playCount 초기화
  }

  function checkDestination(player, piece) {
    const destinations = playerDestinations[player];
    const piecePlayCount = piece.getAttribute('data-playcount');

    // 특정 조건에 따라 목적지로 이동
    if (
      (player === 1 && currentPlayerRect > 47) ||
      (player === 2 && currentPlayerRect > 11) ||
      (player === 3 && currentPlayerRect > 23) ||
      (player === 4 && currentPlayerRect > 35)
    ) {
      if (piecePlayCount === '1') {
        for (let i = 0; i < destinations.length; i++) {
          const dest = document.getElementById(destinations[i]);
          if (dest.childElementCount === 0) {
            dest.appendChild(piece);
            alert(`Player ${player} has reached the destination!`);
            console.log(
              `Player ${player}, Piece ${piece.classList[1]}: has reached the destination`,
            );
            break;
          }
        }
      }
    }
  }
});

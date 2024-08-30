// 매크로를 실행하기 위한 함수 정의
const automateTurn = (
  rollButton: HTMLButtonElement,
  currentPlayer: number,
  totalPlayers: number,
  extraRoll: boolean,
  setCurrentPlayer: (player: number) => void
): boolean => {
  // 말 선택
  const pieces = document.querySelectorAll(`.piece.player${currentPlayer}-piece1`) as NodeListOf<HTMLElement>;
  if (pieces.length > 0) {
    const piece = pieces[0];
    piece.click(); // 자동으로 말 클릭
  } else {
    console.log(`Player ${currentPlayer}의 말이 없습니다.`);
    return extraRoll; // 말이 없으면 턴을 넘기지 않음
  }

  // 주사위 클릭
  rollButton.click();

  // 플레이어 상태 업데이트
  if (!extraRoll) {
    setCurrentPlayer((currentPlayer % totalPlayers) + 1);
  }

  return extraRoll;
};

export default automateTurn
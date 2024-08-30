"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 매크로를 실행하기 위한 함수 정의
var automateTurn = function (rollButton, currentPlayer, totalPlayers, extraRoll, setCurrentPlayer) {
    // 말 선택
    var pieces = document.querySelectorAll(".piece.player".concat(currentPlayer, "-piece1"));
    if (pieces.length > 0) {
        var piece = pieces[0];
        piece.click(); // 자동으로 말 클릭
    }
    else {
        console.log("Player ".concat(currentPlayer, "\uC758 \uB9D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."));
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
exports.default = automateTurn;

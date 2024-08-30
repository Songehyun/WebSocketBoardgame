"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sortMacro_1 = require("./sortMacro"); // automateTurn 함수가 위치한 경로를 지정하세요.
document.addEventListener('DOMContentLoaded', function () {
    var rollButton = document.getElementById('roll-dice');
    var automateButton = document.getElementById('automate-button');
    var currentPlayer = 1;
    var totalPlayers = 4;
    var currentPlayerPiece = null;
    var currentPlayerRect = null;
    var playCount = [0, 0, 0, 0]; // 각 플레이어의 playcount
    var extraRoll = false; // 주사위를 다시 굴릴 수 있는지 여부를 나타내는 플래그
    var automationInterval = null;
    var playerPositions = {
        1: 'rect1',
        2: 'rect13',
        3: 'rect25',
        4: 'rect37',
    };
    var playerDestinations = {
        1: ['player1-dest1', 'player1-dest2', 'player1-dest3', 'player1-dest4'],
        2: ['player2-dest1', 'player2-dest2', 'player2-dest3', 'player2-dest4'],
        3: ['player3-dest1', 'player3-dest2', 'player3-dest3', 'player3-dest4'],
        4: ['player4-dest1', 'player4-dest2', 'player4-dest3', 'player4-dest4'],
    };
    rollButton.addEventListener('click', function () {
        if (!currentPlayerPiece) {
            console.log('먼저 말을 선택하세요!');
            return;
        }
        var diceRoll = Math.floor(Math.random() * 6) + 1;
        console.log("Player ".concat(currentPlayer, " rolled a ").concat(diceRoll));
        if (currentPlayerRect === null) {
            moveToStartPosition(currentPlayer, currentPlayerPiece, diceRoll);
        }
        else {
            movePlayer(currentPlayer, diceRoll);
        }
        if (!extraRoll) {
            currentPlayer = (currentPlayer % totalPlayers) + 1;
        }
        extraRoll = false;
        currentPlayerPiece = null;
    });
    document.querySelectorAll('.piece').forEach(function (piece) {
        piece.addEventListener('click', function () {
            var _a, _b, _c;
            var piecePlayer = (_a = piece.classList[1].match(/\d/)) === null || _a === void 0 ? void 0 : _a[0];
            if (!piecePlayer) {
                return;
            }
            var playerNum = parseInt(piecePlayer, 10);
            if (playerNum !== currentPlayer) {
                console.log("Player ".concat(currentPlayer, "\uC758 \uD134\uC785\uB2C8\uB2E4."));
                return;
            }
            currentPlayerPiece = piece;
            var isInNest = piece.closest('.nest');
            currentPlayerRect = isInNest
                ? null
                : parseInt((_c = (_b = piece.parentElement) === null || _b === void 0 ? void 0 : _b.id.replace('rect', '')) !== null && _c !== void 0 ? _c : '0', 10);
        });
    });
    function moveToStartPosition(player, piece, roll) {
        var _a;
        var startRectId = playerPositions[player];
        var startRectNumber = parseInt(startRectId.replace('rect', ''), 10);
        startRectNumber += roll - 1;
        if (startRectNumber > 48) {
            startRectNumber = startRectNumber - 48;
            playCount[player - 1] = 1;
        }
        var startRect = document.getElementById("rect".concat(startRectNumber));
        if (startRect.childElementCount > 0) {
            var occupyingPlayer = (_a = startRect.firstChild) === null || _a === void 0 ? void 0 : _a.dataset.player;
            if (occupyingPlayer !== undefined && occupyingPlayer !== String(player)) {
                console.log("Player ".concat(occupyingPlayer, "\uC758 \uB9D0\uC774 \uC2DC\uC791 \uC704\uCE58\uC5D0 \uC788\uC2B5\uB2C8\uB2E4."));
                moveToNest(parseInt(occupyingPlayer, 10), startRect.firstChild);
            }
        }
        startRect.appendChild(piece);
        currentPlayerRect = startRectNumber;
    }
    function movePlayer(player, roll) {
        var nextPosition = (currentPlayerRect !== null && currentPlayerRect !== void 0 ? currentPlayerRect : 0) + roll;
        var finalPosition = nextPosition > 48 ? nextPosition - 48 : nextPosition;
        if (nextPosition > 48) {
            playCount[player - 1] = 1;
        }
        var newRect = document.getElementById("rect".concat(finalPosition));
        if (newRect.childElementCount > 0) {
            var firstChild = newRect.firstChild;
            if (firstChild && firstChild.dataset.player) {
                var firstChildPlayer = firstChild.dataset.player;
                var lastChildPlayer = player;
                if (firstChildPlayer === String(lastChildPlayer)) {
                    if (currentPlayerPiece) {
                        newRect.appendChild(currentPlayerPiece);
                    }
                }
                else {
                    Array.from(newRect.children).forEach(function (child) {
                        if (child !== currentPlayerPiece) {
                            var piece = child;
                            var piecePlayer = piece.dataset.player;
                            if (piecePlayer) {
                                moveToNest(parseInt(piecePlayer, 10), piece);
                            }
                        }
                    });
                    if (currentPlayerPiece) {
                        newRect.appendChild(currentPlayerPiece);
                    }
                    console.log("Player ".concat(lastChildPlayer, " rolls again!"));
                    extraRoll = true;
                    return;
                }
            }
        }
        else {
            if (currentPlayerPiece) {
                newRect.appendChild(currentPlayerPiece);
            }
        }
        currentPlayerRect = finalPosition;
    }
    function moveToNest(player, piece) {
        var _a;
        var nest = document.getElementById("player".concat(player, "-nest"));
        var pieceClasses = piece.classList;
        var lastClass = pieceClasses[pieceClasses.length - 1];
        var pieceNumber = (_a = lastClass.match(/\d+$/)) === null || _a === void 0 ? void 0 : _a[0];
        if (!pieceNumber) {
            console.error('Piece number not found');
            return;
        }
        var selector = "#player".concat(player, "-piece-place").concat(pieceNumber);
        var nestPosition = nest.querySelector(selector);
        if (nestPosition) {
            nestPosition.appendChild(piece);
        }
        else {
            console.error('해당 위치에 요소를 찾을 수 없습니다.');
        }
        playCount[player - 1] = 0;
    }
    automateButton.addEventListener('click', function () {
        if (automationInterval) {
            clearInterval(automationInterval);
            automationInterval = null;
            automateButton.textContent = 'Start Automation';
            return;
        }
        automationInterval = setInterval(function () {
            extraRoll = (0, sortMacro_1.default)(rollButton, currentPlayer, totalPlayers, extraRoll, function (player) {
                currentPlayer = player;
            });
        }, 1000);
        automateButton.textContent = 'Stop Automation';
    });
});

import React from 'react';
import {
  playerTurnText,
  diceImages,
  playerPieces,
} from './assets/literal/indexliteral';

const App: React.FC = () => {
  return (
    <div id="root">
      <div id="chat-container">
        <p id="current-player-display">{playerTurnText}</p>
      </div>
      <div className="container">
        {[...Array(48)].map((_, index) => (
          <div key={index} id={`rect${index + 1}`} className="rectangle"></div>
        ))}

        {Object.keys(playerPieces).map((player, playerIndex) =>
          playerPieces[player as keyof typeof playerPieces].map((_, index) => (
            <div
              key={`${player}-dest${index + 1}`}
              id={`${player}-dest${index + 1}`}
              className="rectangle"
            ></div>
          )),
        )}

        {Object.keys(playerPieces).map((player, playerIndex) => (
          <div key={`${player}-nest`} id={`${player}-nest`} className="nest">
            {playerPieces[player as keyof typeof playerPieces].map(
              (piece, index) => (
                <div
                  key={`${player}-piece-place${index + 1}`}
                  id={`${player}-piece-place${index + 1}`}
                  className="place"
                >
                  <div
                    className={`piece ${player}-piece${index + 1}`}
                    data-player={playerIndex + 1}
                  ></div>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
      <div id="dice-container">
        <img id="dice-result" src={diceImages[0]} alt="다이스1" />
        <button id="roll-dice" className="dice-button">
          Roll
        </button>
      </div>
    </div>
  );
};

export default App;

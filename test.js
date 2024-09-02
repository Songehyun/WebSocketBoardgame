document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');

  const chatContainer = document.createElement('div');
  chatContainer.id = 'chat-container';
  const currentPlayerDisplay = document.createElement('p');
  currentPlayerDisplay.id = 'current-player-display';
  currentPlayerDisplay.textContent = 'Player 1의 턴입니다.';
  chatContainer.appendChild(currentPlayerDisplay);

  const container = document.createElement('div');
  container.className = 'container';

  for (let i = 1; i <= 48; i++) {
    const rect = document.createElement('div');
    rect.id = `rect${i}`;
    rect.className = 'rectangle';
    container.appendChild(rect);
  }

  const playerDestinations = [1, 2, 3, 4];
  playerDestinations.forEach((player) => {
    for (let i = 1; i <= 4; i++) {
      const dest = document.createElement('div');
      dest.id = `player${player}-dest${i}`;
      dest.className = 'rectangle';
      container.appendChild(dest);
    }
  });

  for (let player = 1; player <= 4; player++) {
    const nest = document.createElement('div');
    nest.id = `player${player}-nest`;
    nest.className = 'nest';

    for (let i = 1; i <= 4; i++) {
      const place = document.createElement('div');
      place.id = `player${player}-piece-place${i}`;
      place.className = 'place';

      const piece = document.createElement('div');
      piece.className = `piece player${player}-piece${i}`;
      piece.dataset.player = player.toString();
      place.appendChild(piece);
      nest.appendChild(place);
    }

    container.appendChild(nest);
  }

  root.appendChild(chatContainer);
  root.appendChild(container);

  const diceContainer = document.createElement('div');
  diceContainer.id = 'dice-container';

  const diceResult = document.createElement('img');
  diceResult.id = 'dice-result';
  diceResult.src = '../assets/img/1.png';
  diceResult.alt = '다이스1';
  diceContainer.appendChild(diceResult);

  const rollDiceButton = document.createElement('button');
  rollDiceButton.id = 'roll-dice';
  rollDiceButton.className = 'dice-button';
  rollDiceButton.textContent = 'Roll';
  diceContainer.appendChild(rollDiceButton);

  root.appendChild(diceContainer);
});

// highlightMovablePieces.ts
export function highlightMovablePieces(currentPlayer: number) {
  document.querySelectorAll('.piece').forEach((piece) => {
    const piecePlayer = parseInt(
      piece.classList[1]?.match(/\d/)?.[0] ?? '0',
      10,
    );
    const pieceParent = piece.parentElement;

    if (
      piecePlayer === currentPlayer &&
      !(pieceParent && pieceParent.id.includes('dest'))
    ) {
      (piece as HTMLElement).style.border = '2px solid black';
    } else {
      (piece as HTMLElement).style.border = 'none';
    }
  });
}

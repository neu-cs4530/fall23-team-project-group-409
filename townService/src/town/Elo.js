// Function to calculate new Elo ratings
export function calculateEloRating(redPlayer, yellowPlayer, kFactor, result) {
  const expectedOutcomeWinner = 1 / (1 + 10 ** ((yellowPlayer - redPlayer) / 400));
  const expectedOutcomeLoser = 1 / (1 + 10 ** ((redPlayer - yellowPlayer) / 400));

  let actualOutcomeWinner = -1;
  let actualOutcomeLoser = -1;

  if (result === 'win') {
    actualOutcomeWinner = 1;
    actualOutcomeLoser = 0;
  } else if (result === 'loss') {
    actualOutcomeWinner = 0;
    actualOutcomeLoser = 1;
  } else if (result === 'draw') {
    // Assuming a draw contributes to both players' adjustments
    actualOutcomeWinner = 0.5;
    actualOutcomeLoser = 0.5;
  } else {
    throw new Error('Invalid result. Must be "win", "loss", or "draw".');
  }

  const newRedRating = redPlayer + kFactor * (actualOutcomeWinner - expectedOutcomeWinner);
  const newYellowRating = yellowPlayer + kFactor * (actualOutcomeLoser - expectedOutcomeLoser);

  return { newRedRating, newYellowRating };
}

export default calculateEloRating;

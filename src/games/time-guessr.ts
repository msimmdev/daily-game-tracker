type TimeGuessrState = {
  guesses: number;
  score: number;
  scores: number[];
};

const gameName: string = "time-guessr";

const gameUrls = [
  "https://timeguessr.com/roundonedaily",
  "https://timeguessr.com/roundtwodaily",
  "https://timeguessr.com/roundthreedaily",
  "https://timeguessr.com/roundfourdaily",
  "https://timeguessr.com/roundfivedaily",
  "https://timeguessr.com/dailyroundresults",
  "https://timeguessr.com/finalscoredaily"
]

console.log("Time Guessr Tracking Loaded!");

if (gameUrls.some((url) => window.location.href.includes(url))) {
  let status: Message["status"] = "Incomplete";
  let score = 0;
  let guesses = 0;
  const scores: number[] = [];

  const gameId = localStorage.getItem("dailyNumber");

  if (gameId !== null) {

    const roundOneScore = localStorage.getItem("oneTotal");
    if (roundOneScore !== null) {
      const roundOneScoreNum = parseInt(roundOneScore);
      score = score + roundOneScoreNum;
      guesses = 1;
      scores.push(roundOneScoreNum);
    }

    const roundTwoScore = localStorage.getItem("twoTotal");
    if (roundTwoScore !== null) {
      const roundTwoScoreNum = parseInt(roundTwoScore);
      score = score + roundTwoScoreNum;
      guesses = 2;
      scores.push(roundTwoScoreNum);
    }

    const roundThreeScore = localStorage.getItem("threeTotal");
    if (roundThreeScore !== null) {
      const roundThreeScoreNum = parseInt(roundThreeScore);
      score = score + roundThreeScoreNum;
      guesses = 3;
      scores.push(roundThreeScoreNum);
    }

    const roundFourScore = localStorage.getItem("fourTotal");
    if (roundFourScore !== null) {
      const roundFourScoreNum = parseInt(roundFourScore);
      score = score + roundFourScoreNum;
      guesses = 4;
      scores.push(roundFourScoreNum);
    }

    const roundFiveScore = localStorage.getItem("fiveTotal");
    if (roundFiveScore !== null) {
      const roundFiveScoreNum = parseInt(roundFiveScore);
      score = score + roundFiveScoreNum;
      guesses = 5;
      scores.push(roundFiveScoreNum);
      status = "Complete";
    }

    const gameState: TimeGuessrState = {
      guesses: guesses,
      score: score,
      scores: scores,
    };

    const message: Message = {
      game: gameName,
      gameId: gameId,
      status: status,
      stateTime: new Date().toJSON(),
      gameState: gameState,
    }

    console.debug(gameName, message);

    chrome.runtime.sendMessage(message);
  }
}
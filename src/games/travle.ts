type TravleState = {
  guesses: number;
  hints: number;
  guessList: string[];
  perfect: boolean;
  hardMode: boolean;
};

type TravleData = {
  gameProgress: "won" | "ongoing" | "lost";
  guessRatings: string[];
  hardMode: boolean;
  hash: string;
  hintsData: any[];
  pastGuessIds: string[];
  perfect: boolean;
  puzzleIx: number;
}

{
  const gameName = "travle";
  let lastUpdate: number | null = null;
  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes(`https://travle.earth`)) {
      obs.disconnect();
      console.log("Travle Tracking Disconnected");
      return;
    }

    const game = document.querySelector(".map-container");
    if (game !== null) {
      setTimeout(() => {
        const gameStateJSON = localStorage.getItem("travle-game-state");
        if (gameStateJSON != null) {
          const gameState = JSON.parse(gameStateJSON) as TravleData;
          const guesses = gameState.pastGuessIds.length;
          if (guesses !== lastUpdate) {
            lastUpdate = guesses;

            const state: TravleState = {
              guesses: guesses,
              hints: gameState.hintsData.length,
              guessList: gameState.hintsData,
              perfect: gameState.perfect,
              hardMode: gameState.hardMode
            };

            let status: Message["status"] = "Incomplete";
            if (gameState.gameProgress === "won") {
              status = "Complete";
            } else if (gameState.gameProgress === "lost") {
              status = "Failed";
            }

            const message: Message = {
              game: gameName,
              gameId: gameState.puzzleIx.toString(),
              status: status,
              stateTime: new Date().toJSON(),
              gameState: state,
            };

            console.debug(gameName, message);

            chrome.runtime.sendMessage(message);
          }
        }
      }, 100);
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("Travle Tracking Loaded!");
}
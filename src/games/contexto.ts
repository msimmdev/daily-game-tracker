type ContextoState = {
  guesses: number;
  hints: number;
};

type ContextoGame = {
  foundWord: string;
  gameId: number;
  gaveUp: string;
  guessHistory: Record<string, number>[];
  lastGuess: any[];
  numberOfAttempts: number;
  numberOfTips: number;
  postGameHistory: [];
}

type ContextoData = {
  gameData: Record<string, Record<number, ContextoGame>>;
  language: string;
  lastGameId: number;
  openGameId: number;
  version: number;
};

{
  const gameName: string = "contexto";

  let lastUpdate: number = 0;

  const handler = () => {
    const game = document.querySelector("main .top-bar");
    if (game !== null && game.textContent === "Contexto") {
      const today = new Date().toJSON().split("T")[0];
      const gameStateJSON = localStorage.getItem("state");
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as ContextoData;
        if (gameState !== null) {
          const todaysGame = gameState.gameData[gameState.language][gameState.openGameId];
          if (todaysGame !== null) {
            const guesses = todaysGame.numberOfAttempts;
            if (lastUpdate !== guesses) {
              lastUpdate = guesses;

              const state: ContextoState = {
                guesses: guesses,
                hints: todaysGame.numberOfTips,
              };

              let status: Message["status"] = "Incomplete";
              if (todaysGame.gaveUp !== "") {
                status = "Failed";
              } else if (todaysGame.foundWord !== "") {
                status = "Complete";
              }

              const message: Message = {
                game: gameName,
                gameId: gameState.openGameId.toString(),
                status: status,
                stateTime: new Date().toJSON(),
                gameState: state,
              }

              console.debug(gameName, message);

              chrome.runtime.sendMessage(message);
            }
          }
        }
      }
    }
  };

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://contexto.me")) {
      obs.disconnect();
      console.log("Contexto Tracking Disconnected");
      return;
    }
    handler();
  });


  handler();
  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });
  console.log("Contexto Tracking Loaded!");
}
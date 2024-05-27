type SpellingBeeState = {
  guesses: number;
  guessList: string[];
  rank: string;
};

type SpellingBeeDataState = {
  data: {
    answers: string[];
    isRevealed: boolean;
    rank: string;
  };
  puzzleId: string;
  schemaVersion: string;
  timestamp: number;
}

type SpellingBeeStoredState = {
  states: SpellingBeeDataState[];
}

{
  const gameName: string = "nyt-spelling-bee";

  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/puzzles/spelling-bee")) {
      obs.disconnect();
      console.log("NYT Spelling Bee Tracking Disconnected");
      return;
    }

    const game = document.querySelector(".hive");
    if (game !== null && game.checkVisibility()) {
      const today = new Date().toJSON().split("T")[0];

      const gameStateJSON = localStorage.getItem("games-state-spelling_bee/ANON");
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as SpellingBeeStoredState;
        let validState: SpellingBeeDataState | null = null;
        for (const state of gameState.states) {
          const stateDate = new Date(state.timestamp * 1000).toJSON().split("T")[0];
          if (stateDate === today) {
            validState = state;
          }
        }

        if (validState !== null) {
          const guesses = validState.data.answers.length;
          if (lastUpdate !== guesses) {
            lastUpdate = guesses;

            const state: SpellingBeeState = {
              guesses: guesses,
              guessList: validState.data.answers,
              rank: validState.data.rank,
            };

            const message: Message = {
              game: gameName,
              gameId: validState.puzzleId,
              status: guesses > 0 ? "Complete" : "Incomplete",
              stateTime: new Date().toJSON(),
              gameState: state,
            }

            console.log("SEND", message);

            chrome.runtime.sendMessage(message);
          }
        }
      }
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Spelling Bee Tracking Loaded!");
}
type WordleState = {
  guesses: number;
  hardMode: boolean;
  guessList: string[];
};

type WordleDataState = {
  data: {
    boardState: string[];
    currentRowIndex: number;
    hardMode: boolean;
    isPlayingArchive: false;
    status: string;
  };
  puzzleId: string;
  schemaVersion: string;
  timestamp: number;
}

type WordleStoredState = {
  states: WordleDataState[];
}

type WordleSettings = {
  user_id: number;
};

{
  const gameName: string = "nyt-wordle";
  let userName = "ANON";
  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/games/wordle")) {
      obs.disconnect();
      console.log("NYT Wordle Tracking Disconnected");
      return;
    }

    const game = document.getElementById("wordle-app-game");
    if (game !== null) {
      const today = new Date().toJSON().split("T")[0];
      let guesses = 0;
      let status: Message["status"] = "Incomplete";
      let hardMode = false;
      let guessList: string[] = [];

      const gameStateJSON = localStorage.getItem(`games-state-wordleV2/${userName}`);
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as WordleStoredState;
        let validState: WordleDataState | null = null;
        for (const state of gameState.states) {
          const stateDate = new Date(state.timestamp * 1000).toJSON().split("T")[0];
          if (stateDate === today) {
            validState = state;
          }
        }

        if (validState !== null) {
          guesses = validState.data.currentRowIndex;
          if (validState.data.status == "WIN") {
            status = "Complete";
          } else if (validState.data.status == "FAIL") {
            status = "Failed";
          }

          hardMode = validState.data.hardMode;
          guessList = validState.data.boardState.filter((item) => item !== "");
        }
      }

      if (guesses == 6 && status == "Incomplete") {
        status = "Failed"
      }

      if (lastUpdate !== guesses) {
        lastUpdate = guesses;

        const state: WordleState = {
          guesses: guesses,
          hardMode: false,
          guessList: guessList,
        };

        const message: Message = {
          game: gameName,
          gameId: new Date().toJSON().split("T")[0],
          status: status,
          stateTime: new Date().toJSON(),
          gameState: state,
        }

        console.log("SEND", message);

        chrome.runtime.sendMessage(message);
      }
    }
  });

  fetch("https://www.nytimes.com/svc/games/settings/wordleV2")
    .then((res) => {
      if (res.status === 403) {
        return null;
      } else if (res.ok) {
        return res.json() as Promise<WordleSettings>;
      } else {
        throw new Error("Unable to get Wordle user settings");
      }
    })
    .then((data) => {
      if (data !== null) {
        userName = data.user_id.toString();
      }
    })
    .then(() => {
      observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });
    })

  console.log("Wordle Tracking Loaded!");
}

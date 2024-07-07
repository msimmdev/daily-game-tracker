type ConnectionsState = {
  guesses: number;
  mistakes: number;
};

type ConnectionsBetaData = {
  attemptsRemaining: number;
  dayOfTest: number;
  gameStarted: boolean;
  groupsFound: string[];
  highContrastEnabled: boolean;
  history: string[][];
  loading: boolean;
  playedBefore: boolean;
  savedBoard: {
    group: string;
    id: number;
    selected: boolean;
    solved: boolean;
    text: string;
  }[][]
}

type ConnectionsData = {
  data: {
    guesses: {
      cards: {
        level: number;
        position: number;
      }[],
      correct: boolean;
    }[]
    isPlayingArchive: boolean;
    mistakes: number;
    puzzleComplete: boolean;
    puzzleWon: boolean;
  };
  printDate: string;
  puzzleId: string;
  schemaVersion: string;
  timestamp: number;
};

type ConnectionsStoredState = {
  states: ConnectionsData[];
}

{
  const gameName: string = "nyt-connections";

  let userName = "ANON";
  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/games/connections")) {
      obs.disconnect();
      console.log("NYT Connections Tracking Disconnected");
      return;
    }

    const game = document.querySelector("#connections-container .pz-game-screen.on-stage");
    if (game !== null) {
      const today = new Date().toJSON().split("T")[0];
      const gameStateJSON = localStorage.getItem(`games-state-connections/${userName}`);
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as ConnectionsStoredState;
        let validState: ConnectionsData | null = null;
        for (const state of gameState.states) {
          const stateDate = new Date(state.timestamp * 1000).toJSON().split("T")[0];
          if (stateDate === today && !state.data.isPlayingArchive) {
            validState = state;
          }
        }
        if (validState !== null) {
          const guesses = validState.data.guesses.length;
          if (lastUpdate !== guesses) {
            lastUpdate = guesses;

            const state: ConnectionsState = {
              guesses: guesses,
              mistakes: validState.data.mistakes,
            };

            let status: Message["status"] = "Incomplete";
            if (validState.data.puzzleComplete) {
              if (validState.data.puzzleWon) {
                status = "Complete";
              } else {
                status = "Failed";
              }
            }

            const message: Message = {
              game: gameName,
              gameId: validState.puzzleId,
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
      console.log("NYT Connections Tracking Loaded!");
    })
}
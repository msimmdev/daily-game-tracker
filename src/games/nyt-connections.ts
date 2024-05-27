type ConnectionsState = {
  guesses: number;
  groupsFound: string[];
  groupWords: string[][];
};

type ConnectionsData = {
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

{
  const gameName: string = "nyt-connections";

  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/games/connections")) {
      obs.disconnect();
      console.log("NYT Connections Tracking Disconnected");
      return;
    }

    const game = document.querySelector("#connections-container .pz-game-screen.on-stage");
    if (game !== null) {
      const gameStateJSON = localStorage.getItem("nyt-connections-beta");
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as ConnectionsData;
        const guesses = gameState.history.length;
        if (lastUpdate !== guesses) {
          lastUpdate = guesses;

          const state: ConnectionsState = {
            guesses: guesses,
            groupsFound: gameState.groupsFound,
            groupWords: gameState.history,
          };

          const message: Message = {
            game: gameName,
            gameId: gameState.dayOfTest.toString(),
            status: gameState.groupsFound.length == 4 ? "Complete" : "Incomplete",
            stateTime: new Date().toJSON(),
            gameState: state,
          }

          console.log("SEND", message);

          chrome.runtime.sendMessage(message);
        }
      }
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Connections Tracking Loaded!");
}
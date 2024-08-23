type StrandsState = {
  guesses: number;
  wordsFound: number;
  spanagramFound: boolean;
  themeWords: number;
  wordList: string[];
  spangram: string;
};

type StrandsData = {
  hintCount: number;
  hintPoints: number;
  hintUsed: number;
  puzzleID: number;
  shareHistory: string[];
  wordsFound: string[];
  layout: {
    char: string;
    col: number;
    hinted: boolean;
    hintedOrder: number;
    hintedSecondary: boolean;
    id: number;
    row: number;
    spangramed: boolean;
    themed: boolean;
  }[];
  themeFoundPaths: {
    result: string;
    path: {
      id: number;
      hinted: boolean;
    }[]
  }[];
}

{
  const gameName: string = "nyt-strands";

  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/games/strands")) {
      obs.disconnect();
      console.log("NYT Strands Tracking Disconnected");
      return;
    }

    const welcomeScreen = document.querySelector("[class^='welcome-module']");
    if (welcomeScreen !== null && !welcomeScreen.checkVisibility()) {
      const gameStateJSON = localStorage.getItem("nyt-strands-beta");
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as StrandsData;
        const guesses = gameState.wordsFound.length;
        if (lastUpdate !== guesses) {
          lastUpdate = guesses;

          const searchNumWords = document.querySelectorAll("#hint p b");
          if (searchNumWords.length == 2) {
            const num = searchNumWords[1].textContent;
            if (num != null) {
              let spangram = "";
              const themeWords = parseInt(num);
              const wordList: string[] = [];
              for (let i = 0; i < gameState.themeFoundPaths.length; i++) {
                const themeStatus = gameState.themeFoundPaths[i];
                if (themeStatus.result === "THEME" || themeStatus.result === "SPANGRAM") {
                  wordList.push(gameState.wordsFound[i]);
                }

                if (themeStatus.result === "SPANGRAM") {
                  spangram = gameState.wordsFound[i];
                }
              }

              const state: StrandsState = {
                guesses: guesses,
                wordsFound: gameState.shareHistory.length,
                spanagramFound: gameState.themeFoundPaths.some((item) => item.result == "SPANGRAM"),
                themeWords: themeWords,
                wordList: wordList,
                spangram: spangram,
              };

              const message: Message = {
                game: gameName,
                gameId: gameState.puzzleID.toString(),
                status: gameState.shareHistory.length == themeWords ? "Complete" : "Incomplete",
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
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Strands Tracking Loaded!");
}
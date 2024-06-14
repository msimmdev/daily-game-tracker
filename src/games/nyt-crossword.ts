type CrosswordState = {
  totalElapsedTime: number;
  reveals: number;
  checks: number;
  totalClues: number;
  correctClues: number;
};

type CrosswordData = {
  cells: {
    checked: boolean;
    clues: number[];
    confirmed: boolean;
    answer: string;
    guess: string;
    index: number;
    modified: boolean;
    penciled: boolean;
    revealed: boolean;
    type: number;
  }[];
  status: {
    authcheckEnabled: boolean;
    blankCells: number;
    currentProgress: number;
    firsts: {
      cleared: number;
      opened: number;
      solved: number;
    };
    incorrectCells: number;
    isFilled: boolean;
    isSolved: boolean;
    lasCommitID: null;
  },
  timer: {
    isLeavingGame: boolean;
    resetSinceLastCommit: boolean;
    sessionElapsedTime: number;
    totalElapsedTime: number;
  }
}

{
  let gameName: string = "";
  let gameType: string = "";
  let gameId: number;
  let userName = "anon";

  if (window.location.href.includes("https://www.nytimes.com/crosswords/game/mini")) {
    gameName = "nyt-mini-crossword"
    gameType = "mini";
  } else if (window.location.href.includes("https://www.nytimes.com/crosswords/game/daily")) {
    gameName = "nyt-daily-crossword"
    gameType = "daily";
  }

  const observer = new MutationObserver(async (mutationList, obs) => {
    if (!window.location.href.includes(`https://www.nytimes.com/crosswords/game/${gameType}`)) {
      obs.disconnect();
      console.log("NYT Crossword Tracking Disconnected");
      return;
    }

    const game = document.querySelector("#puzzle");
    if (game !== null) {
      setTimeout(() => {
        const gameStateJSON = localStorage.getItem(`localforage/${userName}@${gameId}`);
        if (gameStateJSON != null) {
          const gameState = JSON.parse(gameStateJSON) as CrosswordData;
          const blankCells = gameState.status.blankCells;
          if (lastUpdate !== blankCells) {
            lastUpdate = blankCells;

            const clueCells: Record<number, CrosswordData["cells"]> = {};
            gameState.cells.forEach((cell) => {
              cell.clues.forEach((clueNum) => {
                if (clueNum in clueCells) {
                  clueCells[clueNum].push(cell);
                } else {
                  clueCells[clueNum] = [cell];
                }
              });
            });

            const correctWords = Object.values(clueCells)
              .map((cellList) => cellList.every((cell) => cell.guess !== "" && cell.guess == cell.answer) ? 1 : 0 as number)
              .reduce((accumulator, currentItem) => accumulator + currentItem);

            const state: CrosswordState = {
              totalElapsedTime: gameState.timer.totalElapsedTime,
              reveals: gameState.cells.filter((item) => item.revealed).length,
              checks: gameState.cells.filter((item) => item.confirmed).length + gameState.cells.filter((item) => item.checked).length,
              totalClues: Object.keys(clueCells).length,
              correctClues: correctWords,
            };

            let status: Message["status"] = "Incomplete";
            if (state.reveals > 0 || state.checks > 0) {
              status = "Failed";
            } else if (gameState.status.isSolved) {
              status = "Complete";
            }

            const message: Message = {
              game: gameName,
              gameId: gameId.toString(),
              status: gameState.status.isSolved ? "Complete" : "Incomplete",
              stateTime: new Date().toJSON(),
              gameState: state,
            };

            console.log("SEND", message);

            chrome.runtime.sendMessage(message);
          }
        }
      }, 100);
    }
  });

  let lastUpdate: number | null = null;
  fetch(`https://www.nytimes.com/svc/crosswords/v6/puzzle/${gameType}.json`)
    .then((res) => res.json())
    .then((data) => gameId = data["id"])
    .then(() => fetch("https://www.nytimes.com/svc/games/settings/wordleV2"))
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
    .then(() => observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true }))

  console.log("NYT Crossword Tracking Loaded!");
}
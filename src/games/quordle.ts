type QuordleBoardState = {
  guesses: number;
  guessList: string[];
  status: Message["status"];
};

type QuordleState = {
  guesses: number;
  guessList: string[];
  board1State: QuordleBoardState;
  board2State: QuordleBoardState;
  board3State: QuordleBoardState;
  board4State: QuordleBoardState;
};

{
  const quordleGame: Record<string, "quordle-classic" | "quordle-extreme" | "quordle-chill"> = {
    "https://www.merriam-webster.com/games/quordle/#/": "quordle-classic",
    "https://www.merriam-webster.com/games/quordle/#/extreme": "quordle-extreme",
    "https://www.merriam-webster.com/games/quordle/#/chill": "quordle-chill"
  }

  function processBoard(game: HTMLDivElement, boardNum: number): QuordleBoardState | null {
    const board = game.querySelector(`div[aria-label="Game Board ${boardNum}"]`);
    let guesses = 0;
    let boardCompleted = false;
    let incompelte = false;
    let status: QuordleBoardState["status"] = "Not Started";
    const guessList: string[] = [];
    if (board !== null) {
      for (let i = 0; i < board.childElementCount; i++) {
        const row = board.children[i];
        if (row !== null && row instanceof HTMLDivElement) {
          let guessedWord = "";
          let isCorrect = true;
          for (const letterContainer of row.children) {
            if (letterContainer !== null && letterContainer instanceof HTMLDivElement) {
              const letterMatch = letterContainer.ariaLabel?.match("^(.*?) \\(letter \\d\\) is (.*?)$");
              if (letterMatch !== null && typeof (letterMatch) !== "undefined") {
                const [matchString, letter, letterState] = letterMatch;
                if (letterState !== "correct") {
                  isCorrect = false;
                }
                if (letterState !== "being guessed" && letterState !== "a future guess") {
                  guesses = i + 1;
                  guessedWord = guessedWord + letter.substring(1, 2);
                } else {
                  incompelte = true;
                }
              } else {
                return null;
              }
            } else {
              return null;
            }
          }
          if (guessedWord !== "") {
            guessList.push(guessedWord);
          }

          if (isCorrect) {
            boardCompleted = true;
          }
        } else {
          return null;
        }
      }
    } else {
      return null;
    }

    if (boardCompleted) {
      status = "Complete";
    } else if (incompelte) {
      status = "Incomplete";
    } else if (guesses > 0) {
      status = "Failed";
    }

    return {
      status: status,
      guesses: guesses,
      guessList: guessList,
    };
  }

  let lastUpdate: number = 0;

  const observer = new MutationObserver(async (mutationList, obs) => {
    setTimeout(() => {
      if (!(window.location.href in quordleGame)) {
        obs.disconnect();
        console.log("Quordle Tracking Disconnected");
        return;
      }

      const gameName = quordleGame[window.location.href];

      const game = document.querySelector("#quordle-desktop-scrollbar");
      if (game !== null && game instanceof HTMLDivElement) {
        const board1Data = processBoard(game, 1);
        const board2Data = processBoard(game, 2);
        const board3Data = processBoard(game, 3);
        const board4Data = processBoard(game, 4);

        let status: Message["status"] = "Not Started";
        let guesses = 0;

        if (board1Data !== null && board2Data !== null && board3Data !== null && board4Data !== null) {
          if (board1Data.status == "Failed" || board2Data.status == "Failed" || board3Data.status == "Failed" || board4Data.status == "Failed") {
            status = "Failed";
          } else if (board1Data.status == "Incomplete" || board2Data.status == "Incomplete" || board3Data.status == "Incomplete" || board4Data.status == "Incomplete") {
            status = "Incomplete";
          } else if (board1Data.status == "Complete" && board2Data.status == "Complete" && board3Data.status == "Complete" && board4Data.status == "Complete") {
            status = "Complete";
          }

          guesses = Math.max(board1Data.guesses, board2Data.guesses, board3Data.guesses, board4Data.guesses);

          if (lastUpdate !== guesses) {
            lastUpdate = guesses;

            const gameState: QuordleState = {
              guesses: guesses,
              guessList: board1Data.guessList,
              board1State: board1Data,
              board2State: board2Data,
              board3State: board3Data,
              board4State: board4Data,
            }

            const message: Message = {
              game: gameName ?? "",
              gameId: "",
              status: status,
              stateTime: new Date().toJSON(),
              gameState: gameState,
            };

            console.debug(gameName, message);

            chrome.runtime.sendMessage(message);
          }
        }
      }
    }, 100)
  });

  if (window.location.href in quordleGame) {
    observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true })
    console.log("Quordle Tracking Loaded!");
  }
}
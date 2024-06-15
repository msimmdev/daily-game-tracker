type SudokuState = {
  totalElapsedTime: number;
  audoCandidateMode: boolean;
  correctNumbers: number;
  fillSpaces: number;
  checks: number;
};

type SudokuData = {
  auto: boolean;
  autoCheck: boolean;
  candidateMode: boolean;
  cells: Record<number, {
    answer: number;
    id: number;
    prefilled: boolean;
    value?: number;
    state?: "guessed" | "confirmed"
  }>;
  difficulty: "easy" | "medium" | "hard";
  hints: number[];
  id: string;
  initialTime: number;
  selected: number;
  size: number;
}

{
  let lastUpdate: {
    easy: number | null;
    medium: number | null
    hard: number | null
  } = {
    easy: null,
    medium: null,
    hard: null,
  };

  const observer = new MutationObserver((mutationList, obs) => {
    let regex = new RegExp("https\:\/\/www\.nytimes\.com\/puzzles\/sudoku\/(easy|medium|hard$)");
    if (!regex.test(window.location.href)) {
      obs.disconnect();
      console.log("NYT Sudoku Tracking Disconnected");
      return;
    }

    let gameName: string = "nyt-sudoku-";
    const game = document.querySelector(".pz-content .pz-game-screen.on-stage");
    if (game !== null) {
      const difficulty = game.querySelector(".su-level");
      const difficultyText = difficulty?.textContent as SudokuData["difficulty"];
      gameName = gameName + difficultyText;
      setTimeout(() => {
        const gameStateJSON = localStorage.getItem(`xwd-sudoku-${difficultyText}`);
        if (gameStateJSON != null) {
          const gameState = JSON.parse(gameStateJSON) as SudokuData;
          const correctNumbers = Object.values(gameState.cells).filter((cell) => typeof (cell.state) !== "undefined" && (cell.state == "guessed" || cell.state == "confirmed")).length;

          if (lastUpdate[difficultyText] !== correctNumbers) {
            lastUpdate[difficultyText] = correctNumbers;

            const state: SudokuState = {
              totalElapsedTime: gameState.initialTime / 1000,
              audoCandidateMode: gameState.auto,
              correctNumbers: correctNumbers,
              checks: Object.values(gameState.cells).filter((cell) => typeof (cell.state) !== "undefined" && cell.state == "confirmed").length,
              fillSpaces: Object.values(gameState.cells).filter((cell) => !cell.prefilled).length,
            };

            const message: Message = {
              game: gameName,
              gameId: gameState.id,
              status: Object.values(gameState.cells).some((cell) => !cell.prefilled && typeof (cell.state) === "undefined") ? "Incomplete" : "Complete",
              stateTime: new Date().toJSON(),
              gameState: state,
            }

            console.debug(gameName, message);

            chrome.runtime.sendMessage(message);
          }
        }
      }, 100);
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Sudoku Tracking Loaded!");
}
type EOGuesserState = {
  guesses: number;
  lowestDistance: number;
  distanceTravelled: number;
  score: number;
};

type EoGuesserHistory = {
  hemisphere: "north" | "south";
  off: number;
  points: number;
  quadrant: "northeast" | "northwest" | "southeast" | "southwest";
  solution: number[];
  traveled: number;
};

type EoGuesserData = {
  date: string;
  guesses?: number[][];
  hemisphere: "north" | "south";
  history: EoGuesserHistory[];
  off: number;
  points: number;
  quadrant: "northeast" | "northwest" | "southeast" | "southwest";
  traveled: number;
} | {
  history: EoGuesserHistory[];
} | {};

{
  const gameName = "eo-guesser";
  let lastUpdate: number | null = null;
  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://s2maps.eu/eo-guesser")) {
      obs.disconnect();
      console.log("EO Guesser Tracking Disconnected");
      return;
    }

    const game = document.querySelector("#viewMap canvas");
    if (game !== null) {
      let status: Message["status"] = "Incomplete";
      let guesses = 0;

      const gameStateJSON = localStorage.getItem("eoGuess");
      if (gameStateJSON !== null) {
        const gameState = JSON.parse(gameStateJSON) as EoGuesserData;
        if ("guesses" in gameState || "traveled" in gameState) {
          guesses = gameState.guesses?.length ?? 0;

          if (guesses === 3) {
            status = "Complete";
          }


          if (lastUpdate === null || guesses !== lastUpdate) {
            lastUpdate = guesses;

            const state: EOGuesserState = {
              guesses: guesses,
              lowestDistance: gameState.off,
              distanceTravelled: gameState.traveled,
              score: gameState.points,
            };

            const message: Message = {
              game: gameName,
              gameId: gameState.date,
              status: status,
              stateTime: new Date().toJSON(),
              gameState: state,
            };

            console.debug(gameName, message);

            chrome.runtime.sendMessage(message);
          }
        }
      }
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("EO Guesser Tracking Loaded!");
}
type VertexState = {
  lines: number;
  shapes: number;
};

type VertexData = {
  drawn_lines: number[][];
  drawn_shapes: number[];
  is_complete: boolean;
  pack_id: string;
  puzzle_id: string;
  puzzle_type: string;
  timestamp: number;
}

{
  const gameName: string = "nyt-vertex";

  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/puzzles/vertex")) {
      obs.disconnect();
      console.log("NYT Vertex Tracking Disconnected");
      return;
    }

    const game = document.querySelector(".geo-game.on-stage");
    if (game !== null) {
      const gameStateJSON = localStorage.getItem("vertexProgress");
      if (gameStateJSON != null) {
        const gameState = JSON.parse(gameStateJSON) as VertexData;
        if (gameState.puzzle_type === "daily") {
          const guesses = gameState.drawn_lines.length;
          if (lastUpdate !== guesses) {
            lastUpdate = guesses;

            const state: VertexState = {
              lines: gameState.drawn_lines.length,
              shapes: gameState.drawn_shapes.length,
            };

            const message: Message = {
              game: gameName,
              gameId: gameState.puzzle_id,
              status: gameState.is_complete ? "Complete" : "Incomplete",
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

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Vertex Tracking Loaded!");
}
type GeodleState = {
  guesses: number;
};

{
  const gameName = "geodle";
  let lastUpdate = 0;
  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://geodle.me")) {
      obs.disconnect();
      console.log("Geodle Tracking Disconnected");
      return;
    }

    const game = document.querySelector(".MuiTableContainer-root table");
    if (game !== null && !document.body.innerHTML.includes("How to Play")) {
      let status: Message["status"] = "Incomplete";

      const guessRows = game.querySelectorAll("tr");
      if (guessRows !== null) {
        const guesses = guessRows.length;

        if (guesses > 0 && lastUpdate !== guesses) {
          lastUpdate = guesses;
          const epoch = new Date(2022, 4, 9); // Created on 9th May 2022!
          const today = new Date();
          today.setHours(0, 0, 0); // Make sure both dates are on same time of 00:00:00
          const msPerDay = 1000 * 60 * 60 * 24;
          const dayNumber = Math.round((today.getTime() - epoch.getTime()) / msPerDay);

          if (document.body.innerHTML.includes("You ran out of guesses")) {
            status = "Failed";
          } else if (document.body.innerHTML.includes("You win")) {
            status = "Complete";
          }

          const state: GeodleState = {
            guesses: guesses,
          }

          const message: Message = {
            game: gameName,
            gameId: dayNumber.toString(),
            status: status,
            stateTime: new Date().toJSON(),
            gameState: state,
          };

          console.debug(gameName, message);

          chrome.runtime.sendMessage(message);
        }
      }
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("Geodle Tracking Loaded!");
}
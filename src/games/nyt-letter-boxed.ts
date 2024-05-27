type LetterBoxedState = {

};

type LetterBoxedData = {
}

{
  const gameName: string = "nyt-letter-boxed";

  let lastUpdate: number | null = null;

  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.nytimes.com/puzzles/letter-boxed")) {
      obs.disconnect();
      console.log("NYT Letter Boxed Tracking Disconnected");
      return;
    }

    const game = document.querySelector(".lb-content-box");
    if (game !== null && game.checkVisibility()) {

      const state: LetterBoxedState = {
      };

      const message: Message = {
        game: gameName,
        gameId: "", // TODO
        status: "Incomplete", // TODO
        stateTime: new Date().toJSON(),
        gameState: state,
      }

      console.log("SEND", message);

      chrome.runtime.sendMessage(message);
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Letter Boxed Tracking Loaded!");
}
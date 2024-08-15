type CountrydleState = {
  guesses: number;
  lowestDistance: number;
};

type CountrydleDateData = {
  name: string;
  distance: number;
  direction: string;
};

type CountrydleData = Record<string, CountrydleDateData[]>;

{
  const gameName = "countrydle";
  let lastUpdate: number | null = null;
  const observer = new MutationObserver((mutationList, obs) => {
    if (!window.location.href.includes("https://www.countrydle.com")) {
      obs.disconnect();
      console.log("Countrydle Tracking Disconnected");
      return;
    }

    const game = document.querySelector("img[alt='country to guess']");
    const today = new Date().toJSON().split("T")[0];
    if (game !== null) {
      let status: Message["status"] = "Incomplete";
      let guesses = 0;
      let lowestDistance = Number.MAX_VALUE;

      const gameStateJSON = localStorage.getItem("guesses");
      if (gameStateJSON !== null) {
        const gameState = JSON.parse(gameStateJSON) as CountrydleData;
        if (today in gameState) {
          const todaysGuesses = gameState[today];
          guesses = todaysGuesses.length;
          lowestDistance = todaysGuesses.map((item) => item.distance).reduce((acc, item) => item < acc ? item : acc);

          if (todaysGuesses.some((item) => item.distance === 0)) {
            status = "Complete";
          } else if (guesses === 6) {
            status = "Failed"
          }
        }
      }

      if (lastUpdate === null || guesses !== lastUpdate) {
        lastUpdate = guesses;

        const state: CountrydleState = {
          guesses: guesses,
          lowestDistance: lowestDistance,
        }

        const message: Message = {
          game: gameName,
          gameId: today,
          status: status,
          stateTime: new Date().toJSON(),
          gameState: state,
        };

        console.debug(gameName, message);

        chrome.runtime.sendMessage(message);
      }
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("Countrydle Tracking Loaded!");
}
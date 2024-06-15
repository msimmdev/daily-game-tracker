type LetterBoxedState = {
  guesses: number;
  targetGuesses: number;
  gotLetters: number;
  gotLetterList: string[];
  guessedWords: string[];
};

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
      const gameId = document.querySelector(".pz-game-date")?.textContent;
      if (typeof (gameId) !== "undefined" && gameId !== null) {

        const gussesWords = game.querySelectorAll(".lb-word-list__word");
        const guesses = gussesWords.length;

        console.log("check", guesses, lastUpdate);
        if (guesses !== lastUpdate) {
          lastUpdate = guesses;

          const words: string[] = [];
          for (const word of gussesWords) {
            const content = word.textContent;
            if (content !== null) {
              words.push(content);
            }
          }

          let par = 0;
          const targetText = game.querySelector(".lb-par");
          if (targetText !== null) {
            const parText = targetText.childNodes[1].textContent;
            if (parText !== null) {
              par = parseInt(parText);
            }
          }

          const gotLetters: string[] = [];
          const letterSections = game.querySelectorAll(".lb-word-list__word .opaque");
          for (const letterSection of letterSections) {
            const letter = letterSection.textContent;
            if (letter !== null) {
              gotLetters.push(letter);
            }
          }

          const gotLettersUniq = gotLetters.filter((value, index, array) => array.indexOf(value) === index)

          const state: LetterBoxedState = {
            guesses: guesses,
            guessedWords: words,
            targetGuesses: par,
            gotLetters: gotLettersUniq.length,
            gotLetterList: gotLettersUniq,
          };

          let status: Message["status"] = "Incomplete";
          if (gotLettersUniq.length === 12) {
            if (guesses <= par) {
              status = "Complete";
            } else {
              status = "Failed";
            }
          }

          const message: Message = {
            game: gameName,
            gameId: gameId,
            status: status,
            stateTime: new Date().toJSON(),
            gameState: state,
          }

          console.debug(gameName, message);

          chrome.runtime.sendMessage(message);
        }
      }
    }
  });

  observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });

  console.log("NYT Letter Boxed Tracking Loaded!");
}
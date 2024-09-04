type DailyGame = {
  game: string;
  displayName: string;
  icon: URL;
  url: URL;
  script: string;
}

const dailyGames: DailyGame[] = [
  {
    game: "nyt-wordle",
    displayName: "Wordle",
    icon: new URL(chrome.runtime.getURL("./icons/wordle.svg")),
    url: new URL("https://www.nytimes.com/games/wordle"),
    script: "games/nyt-wordle.js",
  },
  {
    game: "nyt-connections",
    displayName: "Connections",
    icon: new URL(chrome.runtime.getURL("./icons/connections.svg")),
    url: new URL("https://www.nytimes.com/games/connections"),
    script: "games/nyt-connections.js",
  },
  {
    game: "nyt-strands",
    displayName: "Strands",
    icon: new URL(chrome.runtime.getURL("./icons/strands.svg")),
    url: new URL("https://www.nytimes.com/games/strands"),
    script: "games/nyt-strands.js"
  },
  {
    game: "nyt-mini-crossword",
    displayName: "The Mini Crossword",
    icon: new URL(chrome.runtime.getURL("./icons/mini.svg")),
    url: new URL("https://www.nytimes.com/crosswords/game/mini"),
    script: "games/nyt-crossword.js",
  },
  {
    game: "nyt-daily-crossword",
    displayName: "The Crossword",
    icon: new URL(chrome.runtime.getURL("./icons/daily.svg")),
    url: new URL("https://www.nytimes.com/crosswords/game/daily"),
    script: "games/nyt-crossword.js",
  },
  {
    game: "nyt-sudoku-easy",
    displayName: "Sudoku (Easy)",
    icon: new URL(chrome.runtime.getURL("./icons/sudoku.svg")),
    url: new URL("https://www.nytimes.com/puzzles/sudoku/easy"),
    script: "games/nyt-sudoku.js",
  },
  {
    game: "nyt-sudoku-medium",
    displayName: "Sudoku (Medium)",
    icon: new URL(chrome.runtime.getURL("./icons/sudoku.svg")),
    url: new URL("https://www.nytimes.com/puzzles/sudoku/medium"),
    script: "games/nyt-sudoku.js",
  },
  {
    game: "nyt-sudoku-hard",
    displayName: "Sudoku (Hard)",
    icon: new URL(chrome.runtime.getURL("./icons/sudoku.svg")),
    url: new URL("https://www.nytimes.com/puzzles/sudoku/hard"),
    script: "games/nyt-sudoku.js",
  },
  {
    game: "nyt-spelling-bee",
    displayName: "Spelling Bee",
    icon: new URL(chrome.runtime.getURL("./icons/spelling-bee.svg")),
    url: new URL("https://www.nytimes.com/puzzles/spelling-bee"),
    script: "games/nyt-spelling-bee.js",
  },
  {
    game: "nyt-letter-boxed",
    displayName: "Letter Boxed",
    icon: new URL(chrome.runtime.getURL("./icons/letter-boxed.svg")),
    url: new URL("https://www.nytimes.com/puzzles/letter-boxed"),
    script: "games/nyt-letter-boxed.js",
  },
  {
    game: "nyt-vertex",
    displayName: "Vertex",
    icon: new URL(chrome.runtime.getURL("./icons/vertex.svg")),
    url: new URL("https://www.nytimes.com/puzzles/vertex"),
    script: "games/nyt-vertex.js",
  },
  {
    game: "time-guessr",
    displayName: "Time Guessr",
    icon: new URL(chrome.runtime.getURL("./icons/time-guessr.svg")),
    url: new URL("https://timeguessr.com/"),
    script: "games/time-guessr.js"
  },
  {
    game: "travle",
    displayName: "Travle",
    icon: new URL(chrome.runtime.getURL("./icons/travle.svg")),
    url: new URL("https://travle.earth/"),
    script: "games/travle.js"
  },
  {
    game: "countrydle",
    displayName: "Countrydle",
    icon: new URL(chrome.runtime.getURL("./icons/countrydle.png")),
    url: new URL("https://www.countrydle.com/"),
    script: "games/countrydle.js"
  },
  {
    game: "eo-guesser",
    displayName: "EOGuesser",
    icon: new URL(chrome.runtime.getURL("./icons/eo-guesser.png")),
    url: new URL("https://s2maps.eu/eo-guesser/"),
    script: "games/eoguesser.js"
  },
  {
    game: "geodle",
    displayName: "Geodle",
    icon: new URL(chrome.runtime.getURL("./icons/geodle.png")),
    url: new URL("https://geodle.me/"),
    script: "games/geodle.js"
  },
  {
    game: "contexto",
    displayName: "Contexto",
    icon: new URL(chrome.runtime.getURL("./icons/contexto.png")),
    url: new URL("https://contexto.me/"),
    script: "games/contexto.js"
  },
  {
    game: "quordle-classic",
    displayName: "Quordle (Classic)",
    icon: new URL(chrome.runtime.getURL("./icons/quordle.svg")),
    url: new URL("https://www.merriam-webster.com/games/quordle/#/"),
    script: "games/quordle.js"
  },
  {
    game: "quordle-chill",
    displayName: "Quordle (Chill)",
    icon: new URL(chrome.runtime.getURL("./icons/quordle.svg")),
    url: new URL("https://www.merriam-webster.com/games/quordle/#/chill"),
    script: "games/quordle.js"
  },
  {
    game: "quordle-extreme",
    displayName: "Quordle (Extreme)",
    icon: new URL(chrome.runtime.getURL("./icons/quordle.svg")),
    url: new URL("https://www.merriam-webster.com/games/quordle/#/extreme"),
    script: "games/quordle.js"
  }
];

export default dailyGames;
export { DailyGame };
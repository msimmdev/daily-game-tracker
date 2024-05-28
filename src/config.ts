import dailyGames from "./daily-games.js";
import { addGameConfig, getGameConfig } from "./db.js";

document.addEventListener('DOMContentLoaded', async () => {
  await drawGameConfig();
});

async function drawGameConfig(): Promise<void> {
  const existingConfig = await getGameConfig();

  const container = document.getElementById("gamesConfigContainer");
  if (container) {
    for (const game of dailyGames) {
      const gameTemplate = document.getElementById('game-config-item') as HTMLTemplateElement;
      const gameInstance = document.importNode(gameTemplate.content, true);

      const gameIcon = gameInstance.querySelector("img");
      if (gameIcon) {
        gameIcon.setAttribute("src", game.icon.toString());
      }

      const gameInput = gameInstance.querySelector("input");
      if (gameInput) {
        gameInput.id = `game-select-${game.game}`;
        gameInput.value = game.game;
        if (typeof (existingConfig) !== "undefined") {
          if (game.game in existingConfig.enabledGames && existingConfig.enabledGames[game.game]) {
            gameInput.checked = true;
          }
        }
      }

      const gameLabel = gameInstance.querySelector("label");
      if (gameLabel) {
        gameLabel.setAttribute("for", `game-select-${game.game}`);
        gameLabel.textContent = game.displayName;
      }

      container.appendChild(gameInstance);
      if (gameInput) {
        gameInput.addEventListener("change", saveConfig)
      }
    }
  }
}

async function saveConfig(): Promise<void> {
  const selectedGames = document.querySelectorAll<HTMLInputElement>("input.game-selector");
  const gameConfig: Record<string, boolean> = {};
  for (const game of selectedGames) {
    const gameName = game.getAttribute("value");
    if (gameName) {
      if (game.checked) {
        gameConfig[gameName] = true;
      } else {
        gameConfig[gameName] = false;
      }
    }
  }
  console.log(gameConfig);
  await addGameConfig({
    configSetDate: new Date().toJSON(),
    enabledGames: gameConfig,
  });
}
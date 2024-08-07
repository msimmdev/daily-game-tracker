import { getAllData, getGameConfig } from "./db.js";
import dailyGames from "./daily-games.js";

const today = new Date().toJSON().split('T')[0];
let data: State[] = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  await displayPage();
});

document.querySelector("#history-btn")?.addEventListener("click", () => chrome.tabs.create({ url: "detail.html" }));
document.querySelector("#settings-btn")?.addEventListener("click", () => chrome.tabs.create({ url: "config.html" }));
document.querySelector("#issues-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  let link = event.target as HTMLAnchorElement;
  chrome.tabs.create({ url: link.href });
});

async function fetchData(): Promise<void> {
  const dbData = await getAllData(); // Function to fetch data from IndexedDB
  data = dbData.filter((item) => item.lastUpdateTime.split('T')[0] === today);
}

async function displayPage(): Promise<void> {
  const container = document.getElementById('gamesContainer')!;
  container.innerHTML = '';

  let noGames = true;

  const gameConfig = await getGameConfig();
  if (typeof (gameConfig) !== "undefined") {
    for (const gameName of Object.keys(gameConfig.enabledGames).filter((game) => gameConfig.enabledGames[game])) {
      const gameDetail = dailyGames.find((daily) => daily.game === gameName);
      if (typeof (gameDetail) !== "undefined") {
        noGames = false;
        const state = data.find((storedState) => storedState.game === gameName);
        let completionStatus: State["status"];
        completionStatus = state?.status ?? "Not Started";

        const gameTemplate = document.getElementById('game-item') as HTMLTemplateElement;
        const gameInstance = document.importNode(gameTemplate.content, true);

        updateElementText(gameInstance, '.game-badge-text', completionStatus);
        const gameIcon = gameInstance.querySelector(".game-icon");
        if (gameIcon) {
          gameIcon.setAttribute("src", gameDetail.icon.toString());
        }

        const gameLink = gameInstance.querySelector(".game-link");
        gameLink?.setAttribute("title", gameDetail.displayName);

        const gameBadge = gameInstance.querySelector(".game-badge");
        if (gameBadge) {
          if (completionStatus == "Complete")
            gameBadge.classList.add("bg-success");
          else if (completionStatus == "Incomplete")
            gameBadge.classList.add("bg-primary");
          else if (completionStatus == "Not Started") {
            gameBadge.classList.add("bg-secondary");
          } else if (completionStatus == "Failed") {
            gameBadge.classList.add("bg-danger");
          }
        }

        container.appendChild(gameInstance);

        if (gameLink !== null) {
          gameLink?.addEventListener('click', (event) => {
            event.preventDefault();
            chrome.tabs.create({ url: gameDetail.url.href });
          });
          gameLink.dispatchEvent(new Event("registerTooltip"));
        }
      }
    }
  }

  if (noGames) {
    const noGameTemplate = document.getElementById('no-games') as HTMLTemplateElement;
    const noGameInstance = document.importNode(noGameTemplate.content, true);
    const configLink = noGameInstance.querySelector(".config-link");
    container.appendChild(noGameInstance);
    configLink?.addEventListener("click", (event) => {
      event.preventDefault();
      let link = event.target as HTMLAnchorElement;
      chrome.tabs.create({ url: link.href });
    });
  }
}

// Helper function to safely update text content
function updateElementText(parent: DocumentFragment, selector: string, text: string): void {
  const element = parent.querySelector(selector);
  if (element) {
    element.textContent = text;
  } else {
    throw new Error(`Element with selector "${selector}" not found.`);
  }
}
import { getAllData } from "./db.js";
import dailyGames from "./daily-games.js";

const pageSize: number = 20;
let currentPage: number = 0;
let dataByDay: Map<string, Map<string, State | undefined>> = new Map();
let data: State[] = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  initializeDays(data);
  groupDataByDay(data);
  displayPage(currentPage);
});

function groupDataByDay(data: State[]): void {
  data.forEach((item) => {
    const dateKey = item.lastUpdateTime.split('T')[0]; // Get date as YYYY-MM-DD
    if (!dataByDay.has(dateKey)) {
      dataByDay.set(dateKey, new Map(dailyGames.map(game => [game.game, undefined])));
    }
    dataByDay.get(dateKey)!.set(item.game, item);
  });
}

async function fetchData(): Promise<void> {
  data = await getAllData(); // Function to fetch data from IndexedDB
  console.log(data);
  data.sort((a, b) => new Date(b.lastUpdateTime).getTime() - new Date(a.lastUpdateTime).getTime()); // Sorting from most recent to oldest
}

function displayPage(page: number): void {
  const container = document.getElementById('gamesContainer')!;
  container.innerHTML = '';

  const keys = Array.from(dataByDay.keys()).sort().reverse(); // Sorted from most recent to oldest
  const pageKeys = keys.slice(page * pageSize, (page + 1) * pageSize);

  pageKeys.forEach(date => {
    const dayGames = dataByDay.get(date)!;
    const template = document.getElementById('summary-card') as HTMLTemplateElement;
    const instance = document.importNode(template.content, true);
    updateElementText(instance, '.game-date', new Date(date).toLocaleDateString());
    const gameContainer = instance.querySelector(".games");
    if (!gameContainer) {
      throw new Error('Element with selector ".games" not found.')
    }

    dailyGames.forEach(game => {
      const state = dayGames.get(game.game);
      let completionStatus: State["status"];
      if (date !== new Date().toISOString().split('T')[0]) {
        console.log(state);
        if (typeof (state) === "undefined" || state?.status == "Incomplete" || state?.status == "Not Started") {
          completionStatus = "Failed";
        } else {
          completionStatus = state?.status;
        }
      } else {
        completionStatus = state?.status ?? "Not Started";
      }

      const gameTemplate = document.getElementById('game-item') as HTMLTemplateElement;
      const gameInstance = document.importNode(gameTemplate.content, true);

      updateElementText(gameInstance, '.game-badge-text', completionStatus);
      const gameIcon = gameInstance.querySelector(".game-icon");
      if (gameIcon) {
        gameIcon.setAttribute("src", game.icon.toString());
      }

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

      gameContainer.appendChild(gameInstance);

    });

    const endCol = document.createElement("div");
    endCol.classList.add("col");
    gameContainer.appendChild(endCol);

    container.appendChild(instance);
  });

  document.getElementById('pageInfo')!.textContent = `Page ${page + 1} of ${Math.ceil(keys.length / pageSize)}`;
}

function initializeDays(data: State[]): void {
  if (data.length === 0) return;

  const dates = data.map(item => item.lastUpdateTime.split('T')[0]);
  const minDate = new Date(Math.min(...dates.map(date => new Date(date).valueOf())));
  const maxDate = new Date();
  const currentDate = new Date(minDate);

  while (currentDate <= maxDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dataByDay.set(dateKey, new Map(dailyGames.map(game => [game.game, undefined])));
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function changePage(change: number): void {
  const newPage = currentPage + change;
  if (newPage < 0 || newPage >= Math.ceil(data.length / pageSize)) return;
  currentPage = newPage;
  displayPage(currentPage);
}

document.getElementById("prevButton")?.addEventListener("click", () => {
  changePage(-1);
});

document.getElementById("nextButton")?.addEventListener("click", () => {
  changePage(1);
});

// Helper function to safely update text content
function updateElementText(parent: DocumentFragment, selector: string, text: string): void {
  const element = parent.querySelector(selector);
  if (element) {
    element.textContent = text;
  } else {
    throw new Error(`Element with selector "${selector}" not found.`);
  }
}
import { getAllData, getGameConfig } from "./db.js";
import dailyGames from "./daily-games.js";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let dataByDay: Map<string, Map<string, State | undefined>> = new Map();
let data: State[] = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  initializeDays(data);
  groupDataByDay(data);
  await initializeCalendar();
});

async function initializeCalendar() {
  const monthSelects = document.querySelectorAll('.month-select');

  const generateMonthLinks = (year: number, month: number) => {
    const months = [];
    for (let i = -1; i <= 1; i++) {
      const date = new Date(year, month + i);
      months.push({ year: date.getFullYear(), month: date.getMonth() });
    }
    return months;
  };

  const updateMonthSelects = async (year: number, month: number) => {
    const selectedDate = `${year}-${String(month + 1).padStart(2, "0")}`
    const current = new Date();
    const currentMonth = current.getMonth();
    const currentYear = current.getFullYear();
    const months = generateMonthLinks(year, month);

    monthSelects.forEach(async select => {
      const ul = select as HTMLUListElement;
      ul.innerHTML = `
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        ${months.map(({ year: y, month: m }) => {
        if (y > currentYear || (y === currentYear && m > currentMonth)) {
          return `<li class="page-item disabled">
              <span class="page-link month-link" data-year="${y}" data-month="${m}">
                ${monthNames[m]} ${y}
              </span>
            </li>`;
        }
        return `<li class="page-item ${m === month && y === year ? 'active' : ''}">
            ${m === month && y === year ? '<span class="page-link">' + monthNames[m] + ' ' + y + '</span>' : '<a class="page-link month-link" href="#" data-year="' + y + '" data-month="' + m + '">' + monthNames[m] + ' ' + y + '</a>'}
          </li>`;
      }).join('')}
        <li class="page-item ${month === currentMonth && year === currentYear ? "disabled" : ""}">
          ${month === currentMonth && year === currentYear ? '<span class="page-link">&raquo;</span>' : '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>'}
        </li>
      `;

      ul.querySelector('.page-link[aria-label="Previous"]')?.addEventListener('click', async (event) => {
        event.preventDefault();
        const tempDate = new Date(year, month, 1);
        tempDate.setMonth(tempDate.getMonth() - 1);
        await updateMonthSelects(tempDate.getFullYear(), tempDate.getMonth());
      });

      ul.querySelector('.page-link[aria-label="Next"]')?.addEventListener('click', async (event) => {
        if (!(month === currentMonth && year === currentYear)) {
          event.preventDefault();
          const tempDate = new Date(year, month, 1);
          tempDate.setMonth(tempDate.getMonth() + 1);
          await updateMonthSelects(tempDate.getFullYear(), tempDate.getMonth());
        }
      });

      ul.querySelectorAll('a.month-link').forEach(link => {
        link.addEventListener('click', async (event) => {
          event.preventDefault();
          const target = event.target as HTMLAnchorElement;
          const newYear = parseInt(target.getAttribute('data-year') || '0', 10);
          const newMonth = parseInt(target.getAttribute('data-month') || '0', 10);
          await updateMonthSelects(newYear, newMonth);
        });
      });

    });
    await displayPage(selectedDate);
  };

  const now = new Date();
  await updateMonthSelects(now.getFullYear(), now.getMonth());
}

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
  data.sort((a, b) => new Date(b.lastUpdateTime).getTime() - new Date(a.lastUpdateTime).getTime()); // Sorting from most recent to oldest
}

async function displayPage(selectedDate: string): Promise<void> {
  const container = document.getElementById('gamesContainer')!;
  container.innerHTML = '';
  const gameConfig = await getGameConfig();

  let keys = Array.from(dataByDay.keys()).sort();
  const pageKeys = keys.filter((key) => key.startsWith(selectedDate))

  pageKeys.forEach(date => {
    const dayGames = dataByDay.get(date)!;
    const template = document.getElementById('summary-card') as HTMLTemplateElement;
    const instance = document.importNode(template.content, true);
    updateElementText(instance, '.game-date', new Date(date).toLocaleDateString());
    const gameContainer = instance.querySelector(".games");
    if (!gameContainer) {
      throw new Error('Element with selector ".games" not found.')
    }

    dailyGames.filter((game) => gameConfig?.enabledGames[game.game]).forEach(game => {
      const state = dayGames.get(game.game);
      let completionStatus: State["status"];
      if (date !== new Date().toISOString().split('T')[0]) {
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

// Helper function to safely update text content
function updateElementText(parent: DocumentFragment, selector: string, text: string): void {
  const element = parent.querySelector(selector);
  if (element) {
    element.textContent = text;
  } else {
    throw new Error(`Element with selector "${selector}" not found.`);
  }
}
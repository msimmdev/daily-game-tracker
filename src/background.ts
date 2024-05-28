import { addData, getData, getGameConfig } from "./db.js";
import dailyGames from "./daily-games.js";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Check if the tab has completed loading
  if (changeInfo.status === 'complete') {
    // Determine which game site is being visited
    if (typeof (tab.url) !== "undefined") {
      const matchedGame = dailyGames.find((game) => tab.url?.includes(game.url.href));
      if (typeof (matchedGame) !== "undefined") {
        // TODO get Game Config and check it
        const gameConfig = await getGameConfig();
        if (gameConfig?.enabledGames[matchedGame.game]) {
          chrome.scripting.executeScript({ target: { tabId: tabId }, files: [matchedGame.script] });
        }
      }
    }
  }
});

chrome.runtime.onMessage.addListener(async (request: Message, sender, sendResponse) => {
  console.log(request);
  const storeId = request.game + "|" + request.gameId;
  let activeGame = await getData(storeId);
  if (typeof (activeGame) != "undefined") {
    if (new Date(request.stateTime) > new Date(activeGame.lastUpdateTime)) {
      activeGame.lastUpdateTime = request.stateTime;
      activeGame.gameData = request.gameState;
      if (activeGame.status !== "Complete" && request.status === "Complete") {
        activeGame.completeTime = request.stateTime;
      }
      activeGame.status = request.status;
    }
  } else {
    activeGame = {
      game: request.game,
      gameId: request.gameId,
      status: request.status,
      startTime: request.stateTime,
      completeTime: request.stateTime,
      lastUpdateTime: request.stateTime,
      gameData: request.gameState,
    };
  }

  await addData(storeId, activeGame)
});

// chrome.action.onClicked.addListener((tab) => {
//   chrome.tabs.create({
//     url: "detail.html"
//   })
// })
type State = {
  game: string;
  gameId: string;
  status: "Not Started" | "Incomplete" | "Complete" | "Failed";
  startTime: string;
  completeTime: string;
  lastUpdateTime: string;
  gameData: any;
}
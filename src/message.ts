type Message = {
  game: string;
  gameId: string;
  status: "Not Started" | "Incomplete" | "Complete" | "Failed";
  stateTime: string;
  gameState: any;
};
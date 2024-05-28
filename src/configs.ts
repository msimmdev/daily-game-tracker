type GameConfigs = {
  configSetDate: string;
  enabledGames: Record<string, boolean>;
};

type GameConfig = {
  game: string,
  enabled: boolean,

};
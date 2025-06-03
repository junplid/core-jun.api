export interface CreateShootingSpeedDTO_I {
  rootId: number;
  name: string;
  timeBetweenShots: number;
  timeRest: number;
  numberShots: number;
  sequence: number;
  status?: boolean;
}

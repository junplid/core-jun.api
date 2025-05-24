export const memMB = () =>
  +(process.memoryUsage().rss / 1024 / 1024).toFixed(1);

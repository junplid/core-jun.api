export function isWithin24Hours(lastInteractionDate: Date) {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return lastInteractionDate > twentyFourHoursAgo;
}

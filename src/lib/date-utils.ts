export function toISOString(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  return new Date(date).toISOString();
} 
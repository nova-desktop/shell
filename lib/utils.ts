export function truncate(text: string) {
  if (text.length > 50) {
    return text.substring(0, 50) + "...";
  }
  return text;
}

export function range(count: number, start: number = 0): Array<number> {
  return Array.from({ length: count }, (_, i) => i + start);
}

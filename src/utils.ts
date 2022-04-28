export function toCharCodes(str: string): number[] {
  return Array.from(str).map((char) => char.charCodeAt(0));
}

export function fromCharCodes(charCodes: number[]): string {
  return charCodes.map((charCode) => String.fromCharCode(charCode)).join('');
}

export default function leadingZero(num: number): string {
  return `${`${num}`.length === 1 ? '0' : ''}${num}`;
}

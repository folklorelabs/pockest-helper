export default function leadingZero(num) {
  return `${`${num}`.length === 1 ? '0' : ''}${num}`;
}

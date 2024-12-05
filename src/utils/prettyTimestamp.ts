export default function prettyTimeStamp(time: number) {
  console.log({time});
  return (new Date(time)).toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

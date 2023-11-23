export default function getTimeIntervals(startTimestamp, endTimestamp, interval, initial) {
  if (!startTimestamp || !endTimestamp || !interval) return null;
  if (startTimestamp > endTimestamp) return null;
  let returnVal = [];
  const intervalInMs = interval * 60 * 60 * 1000;
  let tempTimestamp = startTimestamp;
  if (!initial) tempTimestamp += intervalInMs;
  while (tempTimestamp < endTimestamp) {
    returnVal = [
      ...returnVal,
      {
        start: tempTimestamp,
        end: tempTimestamp + (1000 * 60 * 60) - 1000,
      },
    ];
    tempTimestamp += intervalInMs;
  }
  return returnVal;
}

export type TimeInterval = {
  start: number;
  end: number;
}

export default function getTimeIntervals(startTimestamp: number, endTimestamp: number, interval: number, offset: number) {
  if (!startTimestamp || !endTimestamp || !interval) return null;
  if (startTimestamp > endTimestamp) return null;
  let returnVal: TimeInterval[] = [];
  const intervalInMs = interval * 60 * 60 * 1000;
  let tempTimestamp = startTimestamp;
  if (offset) tempTimestamp += offset * 60 * 60 * 1000;
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

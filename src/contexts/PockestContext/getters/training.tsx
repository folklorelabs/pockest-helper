import { z } from 'zod';
import MONSTER_AGE from '../../../constants/MONSTER_AGE';
import { STAT_ID_ABBR } from '../../../constants/stats';
import parsePlanId from '../../../utils/parsePlanId';
import {
  trainingLogSchema,
  trainingSkipLogSchema,
} from '../schemas/logEntrySchema';
import PockestState from '../types/PockestState';
import { getCurrentMonsterLogs } from './legacy';

type TrainingInterval = {
  start: number;
  end: number;
  trainingLogs: (
    | z.infer<typeof trainingLogSchema>
    | z.infer<typeof trainingSkipLogSchema>
  )[];
  statId?: string;
  stat?: number;
};

export function getTrainingIntervals(
  pockestState: PockestState,
): TrainingInterval[] {
  if (!pockestState?.data?.monster) return [];
  const trainingWindow = 12 * 60 * 60 * 1000;
  const monsterLifetime = MONSTER_AGE[pockestState?.planAge ?? 6];
  const numTrainings = monsterLifetime / trainingWindow;
  const monsterBirth = pockestState?.data?.monster.live_time;
  const allTrainingLogs = getCurrentMonsterLogs(pockestState, [
    'training',
    'trainingSkip',
  ]);
  const parsedTrainingLogs = z
    .array(
      z.discriminatedUnion('logType', [
        trainingLogSchema,
        trainingSkipLogSchema,
      ]),
    )
    .safeParse(allTrainingLogs);
  const plan = parsePlanId(pockestState.planId);
  const trainingIntervals = Array.from(Array(numTrainings), (_, index) => {
    const start = monsterBirth + index * trainingWindow;
    const end = monsterBirth + (index + 1) * trainingWindow;
    const statId = !pockestState?.autoPlan
      ? STAT_ID_ABBR[pockestState?.stat]
      : pockestState?.statPlanId?.split('')[index] || plan?.primaryStatLetter;
    const stat = !statId
      ? undefined
      : parseInt(
          Object.keys(STAT_ID_ABBR)[
            Object.values(STAT_ID_ABBR).indexOf(statId)
          ],
          10,
        );
    const trainingLogs =
      parsedTrainingLogs.data?.filter(
        (log) => log.timestamp >= start && log.timestamp < end,
      ) || [];
    return {
      start,
      end,
      trainingLogs,
      stat,
      statId,
    };
  });
  return trainingIntervals;
}

export function getTrainingInterval(
  pockestState: PockestState,
  timestamp: number,
) {
  const trainingIntervals = getTrainingIntervals(pockestState);
  const matchingInterval = trainingIntervals.find(
    (interval) => interval.start <= timestamp && interval.end > timestamp,
  );
  return matchingInterval;
}

export function getUpcomingTrainingInterval(pockestState: PockestState) {
  const trainingIntervals = getTrainingIntervals(pockestState);
  const curInterval = trainingIntervals.find((interval) => {
    const now = Date.now();
    return now >= interval.start && now < interval.end;
  });
  const nextInterval = trainingIntervals.find(
    (interval) => curInterval && interval.start === curInterval.end,
  );
  const upcomingInterval = curInterval?.trainingLogs?.length
    ? nextInterval
    : curInterval;
  return upcomingInterval;
}

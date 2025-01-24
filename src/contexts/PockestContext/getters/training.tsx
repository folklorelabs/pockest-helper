import { z } from 'zod';
import { trainingLogSchema, trainingSkipLogSchema } from '../schemas/logEntrySchema';
import PockestState from '../types/PockestState';
import { getCurrentMonsterLogs } from './legacy';
import parsePlanId from '../../../utils/parsePlanId';
import { STAT_ID_ABBR } from '../../../constants/stats';

type TrainingInterval = {
  start: number;
  end: number;
  trainingLogs: (z.infer<typeof trainingLogSchema> | z.infer<typeof trainingSkipLogSchema>)[];
  statId?: string;
  stat?: number;
}

export function getTrainingIntervals(pockestState: PockestState): TrainingInterval[] {
  if (!pockestState?.data?.monster) return [];
  const trainingWindow = 12 * 60 * 60 * 1000;
  const monsterLifetime = 7 * 24 * 60 * 60 * 1000;
  const numTrainings = monsterLifetime / trainingWindow;
  const monsterBirth = pockestState?.data?.monster.live_time;
  const allTrainingLogs = getCurrentMonsterLogs(pockestState, ['training', 'trainingSkip']);
  const parsedTrainingLogs = z.array(z.discriminatedUnion('logType', [
    trainingLogSchema,
    trainingSkipLogSchema,
  ])).safeParse(allTrainingLogs);
  const plan = parsePlanId(pockestState.statPlanId);
  const trainingIntervals = Array.from(Array(numTrainings), (_, index) => {
    const start = monsterBirth + index * trainingWindow;
    const end = monsterBirth + (index + 1) * trainingWindow;
    const statId = !pockestState?.autoPlan ? STAT_ID_ABBR[pockestState?.stat] : pockestState?.statPlanId.split('')[index] || plan?.primaryStat;
    const stat = !statId ? undefined : parseInt(Object.keys(STAT_ID_ABBR)[Object.values(STAT_ID_ABBR).indexOf(statId)], 10);
    return {
      start,
      end,
      trainingLogs: parsedTrainingLogs.data?.filter((log) => start <= log.timestamp && end > log.timestamp) || [],
      stat,
      statId,
    };
  });
  return trainingIntervals;
}

export function getTrainingInterval(pockestState: PockestState, timestamp: number) {
  const trainingIntervals = getTrainingIntervals(pockestState);
  const matchingInterval = trainingIntervals.find((interval) => interval.start <= timestamp && interval.end > timestamp);
  return matchingInterval;
}

import { STAT_ABBR } from '../config/stats';
import { LEGACY_EGG_IDS } from '../config/eggs';
import { ROUTES } from '../config/routes';

export const LEGACY_PLAN_REGEX = /^([W|G|Y|B|R|L])([1-6])([A|B|C][L|R])([T|S|P])$/;
export const PLAN_REGEX = /^(\d*)([A|B|C][L|R])([T|S|P])([1-6])$/;

export function parsePlanId(planId) {
  if (!planId) return null;
  const isLegacy = LEGACY_PLAN_REGEX.test(planId);
  const planIdSplit = isLegacy ? LEGACY_PLAN_REGEX.exec(planId)
    : PLAN_REGEX.exec(planId);
  if (!planIdSplit) return null;
  const planEggString = isLegacy ? `${LEGACY_EGG_IDS.indexOf(planIdSplit[1])}` : planIdSplit[1];
  const primaryStatLetter = isLegacy ? planIdSplit[4] : planIdSplit[3];
  const routeId = isLegacy ? planIdSplit[3] : planIdSplit[2];
  const planAgeString = isLegacy ? planIdSplit[2] : planIdSplit[4];
  return {
    planId: `${planEggString}${routeId}${primaryStatLetter}${planAgeString}`,
    planEgg: parseInt(planEggString, 10),
    planRoute: ROUTES[routeId],
    primaryStatLetter,
    primaryStat: `${STAT_ABBR[primaryStatLetter]}`,
    planAge: parseInt(planAgeString, 10),
  };
}

export default parsePlanId;

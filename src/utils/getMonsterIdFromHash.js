export default function getMonsterIdFromHash(hash) {
  return parseInt(hash?.split('-')[0] || '-1', 10);
}

export default function getMonsterIdFromHash(hash: string) {
  return parseInt(hash?.split('-')[0] || '-1', 10);
}

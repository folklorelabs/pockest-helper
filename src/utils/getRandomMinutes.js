export default function getRandomMinutes(staticMins, dynamicMins = 1) {
  const staticOffset = 1000 * 60 * staticMins; // static offset
  const dynamicMinOffset = Math.round(Math.random() * 1000 * 60 * dynamicMins); // 0-dynamicMins
  const dynamicSecOffset = Math.round(Math.random() * 1000 * 59); // 0-59s
  const dynamicMsOffset = Math.round(Math.random() * 999); // 0-999ms
  return staticOffset + dynamicMinOffset + dynamicSecOffset + dynamicMsOffset;
}

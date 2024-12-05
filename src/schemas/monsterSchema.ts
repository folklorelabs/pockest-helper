import sheetMonsterSchema from './sheetMonsterSchema';
import encycloMonsterSchema from './encycloMonsterSchema';

const monsterSchema = sheetMonsterSchema.and(encycloMonsterSchema);

export default monsterSchema;
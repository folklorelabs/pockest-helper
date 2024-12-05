import { z } from 'zod';

import encycloBookSchema from '../schemas/encycloBookSchema';

type BucklerEncycloBook = z.infer<typeof encycloBookSchema>;

export default BucklerEncycloBook;
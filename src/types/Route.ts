import { z } from 'zod';

import routeSchema from '../schemas/routeSchema';

type Route = z.infer<typeof routeSchema>;

export default Route;
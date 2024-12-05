import { z } from 'zod';

const githubReleaseSchema = z.object({
  url: z.string(),
  prerelease: z.boolean(),
  tag_name: z.string(),
});

export default githubReleaseSchema;

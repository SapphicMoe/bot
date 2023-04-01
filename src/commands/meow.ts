import { z } from 'zod';

import { defineCommand } from '../lib/Command';

export default defineCommand({
  name: 'meow',
  description: 'meow!',
  category: 'util',
  args: z.tuple([z.enum(['nya', 'meow'])]),
  async preCheck(ctx) {
    if (ctx.msg.author.id === '312145496179474434') await ctx.send('mraow :3');

    return false;
  },
  async run(ctx) {
    await ctx.send(ctx.args[0]);
  },
});

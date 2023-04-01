import { defineCommand } from '../lib/Command';

export default defineCommand({
  name: 'ping',
  description: 'Pings and checks the latency of the bot.',
  category: 'util',
  async run(ctx: any) {
    await ctx.send('Pong!');
  },
});

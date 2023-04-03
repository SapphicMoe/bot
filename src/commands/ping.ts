import { defineCommand } from '../lib/Command';

export default defineCommand({
  name: 'ping',
  description: 'Pings and checks the latency of the bot.',
  aliases: ['pong'],
  category: 'util',
  async run(ctx) {
    const message = await ctx.send('Ping...');
    const ping = Math.floor(message.createdAt - ctx.msg.createdAt);

    return message.edit(`Pong! Took ${ping} ms.`);
  },
});

import { defineCommand } from '../lib/Command';

export default defineCommand({
  name: 'avatar',
  description: 'Pings and checks the latency of the bot.',
  aliases: ['pfp'],
  category: 'info',
  async run(ctx) {
    const user = ctx.client.users.get(ctx.args[0]) || ctx.msg.mentions[0] || ctx.msg.author;

    const file = await fetch(user.avatarURL.replace('128', '2048'))
      .then((res) => res.arrayBuffer())
      // eslint-disable-next-line @typescript-eslint/unbound-method
      .then(Buffer.from);

    await ctx.channel.createMessage({
      attachments: [
        {
          filename: `${user.username}.${user.avatar?.startsWith('a_') ? 'gif' : 'png'}`,
          file,
        },
      ],
    });
  },
});

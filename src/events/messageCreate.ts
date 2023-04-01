import { config } from '../../config';
import { createExecutor } from '../handlers/Executor';
import { defineEvent } from '../lib/Event';

export default defineEvent({
  name: 'messageCreate',
  async execute(client, msg: any) {
    const { execute } = createExecutor(client, (msg) => {
      if (msg.content.startsWith(config.prefix)) return msg.content.slice(config.prefix.length);
    });

    if (msg.author.bot) return;

    await execute(msg);
  },
});

import signale from 'signale';

import { defineEvent } from '../lib/Event';

export default defineEvent({
  name: 'ready',
  once: true,
  execute(client) {
    signale.start(`Logged in as ${client.user.username}#${client.user.discriminator} (ID: ${client.user.id}).`);
    signale.success(`Loaded ${client.commands.size} commands.`);
  },
});

import signale from 'signale';

import { config } from '../config';

import { AbstractBot } from './lib/Client';

const execute = async () => {
  const bot = new AbstractBot(config.token, {
    gateway: {
      intents: ['all'],
    },
  });

  await bot.init();
};

execute().catch(signale.error);

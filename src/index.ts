import { Client, Message } from '@projectdysnomia/dysnomia';

import { config } from '../config';

const execute = async () => {
  const client = new Client(config.token, {
    gateway: {
      intents: ['all'],
    },
  });

  client.on('ready', () => {
    console.log('Ready!');
  });

  client.on('error', (err: Error) => {
    console.error(err);
  });

  client.on('messageCreate', async (msg: Message) => {
    if (msg.content === '!ping') await msg.channel.createMessage('Pong!');
    else if (msg.content === '!pong') await msg.channel.createMessage('Ping!');
  });

  await client.connect();
};

execute().catch(console.error);

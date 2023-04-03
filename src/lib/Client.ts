import { Client, ClientOptions } from '@projectdysnomia/dysnomia';
import signale from 'signale';

import { join } from 'node:path';

import { loadEvents, Commands, loadCommands } from '../handlers/Executor';

export class AbstractBot extends Client {
  commands: Commands = new Map();

  constructor(token: string, options: ClientOptions = {}) {
    super(token, options);

    if (!token) signale.error('No token provided. Terminating session.');
  }

  async init() {
    await loadCommands(this, join(__dirname, '../commands'));
    await loadEvents(this, join(__dirname, '../events'));
    await this.connect();
  }
}

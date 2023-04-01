import { Client, ClientOptions } from '@projectdysnomia/dysnomia';
import signale from 'signale';

import { loadEvents, Commands } from '../handlers/Executor';

export class AbstractBot extends Client {
  commands: Commands = new Map();

  constructor(token: string, options: ClientOptions = {}) {
    super(token, options);

    if (!token) signale.error('No token provided. Terminating session.');
  }

  async init() {
    await loadEvents(this);
    await this.connect();
  }
}

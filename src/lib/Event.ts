import { ClientEvents } from '@projectdysnomia/dysnomia';

import { AbstractBot } from './Client';
import { Promisable } from './Util';

export interface Event<K extends keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (client: AbstractBot, ...args: ClientEvents[K]) => Promisable<void>;
}

export const defineEvent = <K extends keyof ClientEvents>(opts: Event<K>) => opts;

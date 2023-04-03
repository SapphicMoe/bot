import { z } from 'zod';

import { Promisable } from './Util';

import type { Context } from './Context';

export interface Command<A extends z.AnyZodTuple, F extends z.AnyZodObject> {
  name: string;
  description: string;
  aliases?: string[];
  args?: A;
  flags?: F;
  category: commandCategory;
  preCheck?(ctx: Context<z.infer<A>, z.infer<F>>): Promisable<boolean>;
  run(ctx: Context<z.infer<A>, z.infer<F>>): Promise<any>;
}

export const defineCommand = <A extends z.AnyZodTuple, F extends z.AnyZodObject>(opts: Command<A, F>) => opts;

export type commandCategory = 'info' | 'util';

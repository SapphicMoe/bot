import signale from 'signale';
import { z } from 'zod';

import { readdir } from 'node:fs/promises';

import { AbstractBot } from '../lib/Client';
import { Command } from '../lib/Command';
import { Context } from '../lib/Context';
import { parse, Promisable, PromiseInner } from '../lib/Util';

import type { GuildTextableChannel, Message } from '@projectdysnomia/dysnomia';

const isGuildMsg = (msg: Message): msg is Message<GuildTextableChannel> => !!msg.guildID;

const execute = async (
  commands: Commands,
  getCleanContent: GetCleanContent,
  errorHandlers: ErrorHandlers | undefined,
  msg: Message,
  client: AbstractBot
) => {
  if (msg.author.bot || !isGuildMsg(msg)) return;

  const cleanContent = await getCleanContent(msg);
  if (!cleanContent) return;

  const [name, ...rawArgs] = cleanContent.split(' ');
  let cmd = commands.get(name);

  if (!cmd) for (const c of client.commands.values()) if (c.aliases?.includes(name)) cmd = c;
  if (!cmd) return;

  let parsed: PromiseInner<ReturnType<typeof parse>>;

  try {
    parsed = await parse(rawArgs.join(' '), cmd.args, cmd.flags);
  } catch (err) {
    await (errorHandlers?.argError ?? defaultErrorHandler)(msg, err, cmd);
    return;
  }

  const ctx = new Context(msg, rawArgs, parsed!.args, parsed!.flags, client);
  if (!((await cmd.preCheck?.(ctx)) ?? true)) return;

  try {
    await cmd.run(ctx);
    signale.info(
      `${msg.author.username}#${msg.author.discriminator} (ID: ${msg.author.id}) ran command: ${cmd.name} (${cmd.category})`
    );
  } catch (err) {
    await (errorHandlers?.commandError ?? defaultErrorHandler)(msg, err, cmd);
  }
};

const defaultErrorHandler: ErrorHandler = async (msg, err, cmd) => {
  if (err instanceof z.ZodError) {
    const flat = err.flatten();
    signale.error(
      `${msg.author.username}#${msg.author.discriminator} (ID: ${msg.author.id}) tried running the command ${
        cmd.name
      } (${cmd.category}), but an error occured:\n${JSON.stringify(flat)}`
    );

    return;
  }

  signale.error(err);
  await msg.channel.createMessage('An error occured!');
};

export const loadCommands = async (client: AbstractBot, directory: string) => {
  const cmds = await readdir(directory);

  await Promise.all(
    cmds.map(async (cmd: string) => {
      if (process.env.NODE_ENV === 'production' && !cmd.endsWith('.js')) return;
      const { default: command } = await import(`${directory}/${cmd}`);

      client.commands.set(command.name, command);
    })
  );
};

export const loadEvents = async (client: AbstractBot, directory: string) => {
  const events = await readdir(directory);

  await Promise.all(
    events.map(async (evt: string) => {
      if (process.env.NODE_ENV === 'production' && !evt.endsWith('.js')) return;
      const event = await import(`${directory}/${evt}`);

      if (event.default.once) client.once(event.default.name, (...args) => event.default.execute(client, ...args));
      else client.on(event.default.name, (...args) => event.default.execute(client, ...args));
    })
  );
};

export const createExecutor = (
  client: AbstractBot,
  getCleanContent: GetCleanContent,
  errorHandlers?: ErrorHandlers
) => {
  const _execute = (msg: Message) => execute(client.commands, getCleanContent, errorHandlers, msg, client);
  const { commands } = client;

  return { commands, execute: _execute };
};

export type Commands = Map<string, Command<z.AnyZodTuple, z.AnyZodObject>>;

export type GetCleanContent = (msg: Message) => Promisable<string | false> | Promisable<void>;

export type ErrorHandler = (
  msg: Message,
  error: unknown,
  cmd: Command<z.AnyZodTuple, z.AnyZodObject>
) => Promisable<void>;

export interface ErrorHandlers {
  argError: ErrorHandler;
  commandError: ErrorHandler;
}

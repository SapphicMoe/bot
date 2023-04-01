import signale from 'signale';
import { z } from 'zod';

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

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
  const cmd = commands.get(name);

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
    signale.info(
      `${msg.author.username}#${msg.author.discriminator} (ID: ${msg.author.id}) ran command: ${cmd.name} (${cmd.category})`
    );
    await cmd.run(ctx);
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

export const loadCommands = async (client: AbstractBot) => {
  const cmds = await readdir('./src/commands/');

  await Promise.all(
    cmds.map(async (cmd: string) => {
      const { default: command } = await import(join(`../commands/${cmd}`));

      client.commands.set(command.name, command);
    })
  );
};

export const loadEvents = async (client: AbstractBot) => {
  const events = await readdir('./src/events');

  await Promise.all(
    events.map(async (evt: string) => {
      const event = await import(join(`../events/${evt}`));

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

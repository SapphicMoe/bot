import type { Client, GuildTextableChannel, Message } from '@projectdysnomia/dysnomia';

export class Context<A = any[], F = Record<string, unknown>> {
  constructor(
    public readonly msg: Message<GuildTextableChannel>,
    public readonly rawArgs: string[],
    public readonly args: A,
    public readonly flags: F,
    public readonly client: Client
  ) {}

  get channel() {
    return this.msg.channel;
  }

  get guild() {
    return this.channel.guild;
  }

  get send() {
    return this.channel.createMessage.bind(this.channel);
  }
}

import { Command, Discord, Core } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Проверить время ответа бота. Зависит от хостинга и от дискорда.",
      syntax: `${this.client.prefix}пинг`,
      example: `${this.client.prefix}пинг`,
    };
  }

  async run(msg: Discord.Message, args: string[]) {
    const m = await msg.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${
      m.createdTimestamp - msg.createdTimestamp
      }ms. API Latency is ${Math.round(this.client.ws.ping)}ms`
    );
  }
}

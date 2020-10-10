import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { timeout } from "cron";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Удалить ВСЕ автореакции с определенного канала",
      syntax: `${this.client.prefix}реакцииудалить [ID канала]`,
      example: `${this.client.prefix}реакцииудалить 605185840750002177`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const emoji = this.client.db.getCollection("discordemojis")!;
    const { guild, channel, mentions, member } = message;
    if (!args[0]) return message.reply("Не указали канал!").then((msg) => msg.delete({ timeout: 10000 }));
    await emoji.deleteOne({
      channelid: args[0],
    });
    return message
      .reply("Выполнил :)")
  }
}

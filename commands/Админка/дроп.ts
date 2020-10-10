import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
      aliases: ["дроп"]
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Сгенерировать и выбросить валюту сервера",
      syntax: `${this.client.prefix}дроп [сумма]`,
      example: `${this.client.prefix}дроп 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member } = message;
    const amount = wholeNumber(Number(args[0]));
    const Drops = this.client.db.getCollection("drops")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    if (!Number.isInteger(amount)) return;
    if (amount == 0) return;

    await Drops.insertOne({
      channelID: channel.id,
      value: amount,
    });
    const notify = new Discord.MessageEmbed()
      .setColor(member!.displayColor)
      .setDescription(`${member} выбросил **${amount}**${config!.CurrencyLogo}`)
      .setFooter(
        `Используйте команду - \"${
        config!.prefix
        }пик\", чтобы забрать звёзды себе!`
      );

    return channel.send(notify);
  }
}

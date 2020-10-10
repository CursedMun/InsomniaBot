import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {
      aliases: ["$"],
    };
  }
  get customOptions() {
    return {
      group: "Экономика",
      help: "Посмотреть баланс серверной валюты",
      syntax: `${this.client.prefix}баланс | ${this.client.prefix}$`,
      example: `${this.client.prefix}баланс`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);
    const selected = target && target.id !== member!.id ? target : member;
    let user = await Users.getOne({ userId: selected!.id });

    const notify = new Discord.MessageEmbed();
    const balance = `${user.Currency}${config!.CurrencyLogo}`;

    if (selected!.id === member!.id) {
      notify
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(`Ваш баланс составляет **${balance}**`)
        .setFooter(
          `Используйте команду - "!получить", чтобы забрать ${
          config!.DailyCount
          } ежедневных звёзд!`
        );
    } else {
      notify
        .setColor(target!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(`Баланс ${target} составляет **${balance}**`);
    }

    return channel.send(notify).catch(console.error);
  }
}

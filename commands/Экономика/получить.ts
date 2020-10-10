import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { unixTime } from "../../util/helpers";
import { convertUnixToTime } from "../../util/functions";
import { setLastDaily } from "../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Экономика",
      help: "Получить ежедневную награду",
      syntax: `${this.client.prefix}получить`,
      example: `${this.client.prefix}получить`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { channel, member } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    let user = await Users.getOne({ userId: member!.id });

    const unix = unixTime();
    const notify = new Discord.MessageEmbed();

    if (user!.lastDaily && unix < user!.lastDaily) {
      const time = convertUnixToTime(user!.lastDaily);

      let through =
        time.hour >= 1 && time.hour <= 24
          ? `${time.hour} ч.`
          : time.min > 0 && time.min <= 60
            ? `${time.min} м.`
            : `${time.sec} с.`;
      notify
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(
          `Ты уже получил свою ежедневную награду сегодня!\nДо следующей осталось **${through}**`
        )
        .setFooter(`Придётся подождать😴`);

      return channel.send(notify).catch(console.error);
    } else {
      setLastDaily(
        member!,
        config!.DailyCount,
        unix + config!.DailyTime,
        this.client
      ).catch(console.error);
      const time = convertUnixToTime(unix + config!.DailyTime);

      let through =
        time.hour >= 1 && time.hour <= 24
          ? `${time.hour} ч. ${time.min} м. `
          : time.min > 0 && time.min <= 60
            ? `${time.min} м. `
            : `${time.sec} с. `;

      notify
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(
          `Вот твои ежедневные **${config!.DailyCount}**${config!.CurrencyLogo}`
        )
        .setFooter(
          `Свои следующие ${
          config!.DailyCount
          } звёзд вы сможете получить через ${through}!`
        );
      return channel.send(notify);
    }
  }
}

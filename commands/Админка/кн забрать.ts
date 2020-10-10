import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";
import { withdrawPack } from "../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
      name: "кн забрать",
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Конфисковать контейнеры @user",
      syntax: `${this.client.prefix}кн забрать [кол-во] @user`,
      example: `${this.client.prefix}кн забрать @user 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, mentions } = message;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    const target =
      mentions!.members!.first() || guild!.members.cache.get(args[0]);

    const amount = wholeNumber(Number(args[1]));
    if (!amount) return;
    if (!Number.isInteger(amount) && amount <= 0) return;

    await withdrawPack(target!, amount, this.client).then(async (result) => {
      if (!result) return;

      const notify = new Discord.MessageEmbed();

      notify
        .setColor(member!.displayColor)
        .setTitle("Конфискация контейнеров")
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(
          `${member} забрал **${amount}** <:box:632957783318462484> у пользователя ${target}`
        );

      return channel.send(notify).catch(console.error);
    });
  }
}

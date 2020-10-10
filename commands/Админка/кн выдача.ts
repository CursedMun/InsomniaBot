import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";
import {
  withdrawTransaction,
  awardTransaction,
  awardPack,
  withdrawPack,
} from "../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {
      name: "кн выдача",
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Выдать контейнеры @user",
      syntax: `${this.client.prefix}кн выдача @user [кол-во]`,
      example: `${this.client.prefix}кн выдача user 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, mentions } = message;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    const amount: number = Number(args[1]);
    if (!Number.isInteger(amount)) return;

    if (amount <= 0) return;

    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);

    awardPack(target!, amount, this.client).catch(console.error);

    const notify = new Discord.MessageEmbed();

    notify
      .setColor(member!.displayColor)
      .setTitle("Выдача контейнеров")
      .setAuthor(
        member!.displayName,
        member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
      )
      .setDescription(
        `${member} выдал **${amount}** <:box:632957783318462484> пользователю ${target}`
      );

    return channel.send(notify).catch(console.error);
  }
}

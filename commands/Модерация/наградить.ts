import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";
import { awardTransaction } from "../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Moderator,
    };
  }
  get customOptions() {
    return {
      group: "Модерация",
      help: "Выдать @user валюту",
      syntax: `${this.client.prefix}наградить @user [сумма]`,
      example: `${this.client.prefix}наградить @user [сумма]`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    message.delete()
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    });
    const regex = /[0-9]*$/igm;

    const match = args.join("").match(regex)?.filter(Boolean)
    const amount = wholeNumber(Number(match));
    if (!Number.isInteger(amount)) return;
    if (amount <= 0) return;
    if (mentions.members)
      mentions.members!.forEach(async member => {
        member

        await awardTransaction(member!, amount, this.client).catch(console.error);

        const notify = new Discord.MessageEmbed();

        notify
          .setColor(member!.displayColor)
          .setTitle("Выдача звёзд")
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(
            `${message.member} выдал **${amount}**${
            config!.CurrencyLogo
            } пользователю ${member}`
          );

        return channel.send(notify);
      });

  }
}

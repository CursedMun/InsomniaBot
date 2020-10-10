import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { withdrawTransaction } from "../../Methods/allRelatedToCurrency";
import { wholeNumber } from "../../util/functions";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Забрать валюту у @user",
      syntax: `${this.client.prefix}забрать @user [сумма]`,
      example: `${this.client.prefix}забрать @user 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    });
    const amount = wholeNumber(Number(args[1]));
    if (!amount) return;
    if (!Number.isInteger(amount) && amount <= 0) return;

    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);

    withdrawTransaction(target!, amount, this.client, Constants.TransactionsTypes[1])
      .then((result) => {
        const notify = new Discord.MessageEmbed();
        if (typeof result === "boolean" && !result) {
          notify.setDescription("У него нет столько звёзд")
        } else {
          notify
            .setColor(member!.displayColor)
            .setTitle("Конфискация звёзд")
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(
              `${member} забрал **${result}**${
              config!.CurrencyLogo
              } у пользователя ${target}`
            );
        }


        return channel.send(notify);
      })
      .catch(function (err) {
        // print the error details
        console.log(err);
      });
  }
}

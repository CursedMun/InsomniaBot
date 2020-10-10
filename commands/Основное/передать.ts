import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";
import { transferTransaction } from "../../Methods/allRelatedToCurrency";
import moment from "moment";
export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.NitroBooster,
    };
  }
  get customOptions() {
    return {
      group: "Основное",
      help: "Передать валюту сервера",
      syntax: `${this.client.prefix}передать @user [сумму]`,
      example: `${this.client.prefix}передать @user 1000`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const Configs = this.client.db.getCollection("configs")!;
    const { member, mentions, guild, channel } = message;

    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);
    if (!target || target.id === member!.id) return;
    const amount = wholeNumber(Number(args[1]));
    if (!Number.isInteger(amount) || amount <= 0) return;
    const config = await Configs.getOne({ guildId: message.guild?.id });

    transferTransaction(member!, target, amount, this.client).then((result) => {
      if (typeof result === "boolean" && !result) {
        return channel
          .send(
            new Discord.MessageEmbed()
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true })
              )
              .setDescription(`У тебя нет столько ${config!.CurrencyLogo}.`)
          )
          .catch(console.error);
      }

      // Сообщение в чат

      const notify = new Discord.MessageEmbed()
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true })
        )
        .setDescription(
          `${member} передал ${target} **${result}** ${config!.CurrencyLogo}.`
        );

      channel.send(notify)

      // Сообщение упомянотому пользователю в лс

      const dm = new Discord.MessageEmbed()
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true })
        )
        .setDescription(
          `${member} передал тебе **${result}** ${config!.CurrencyLogo}`
        );

      return target.send(dm).catch(err => console.error(`Не смог отправить sms в лс ${message.member!.user.tag}`));
    });
  }
}

import { Command, Discord, Core } from "discore.js";
import Constants from "../../util/Constants";
import { transferTransaction } from "../../Methods/allRelatedToCurrency";
import { wholeNumber } from "../../util/functions";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Demon,
    };
  }
  get customOptions() {
    return {
      group: "Экономика",
      help: "Передать валюту",
      syntax: `${this.client.prefix}передать @user [сумма]`,
      example: `${this.client.prefix}передать @user 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { mentions, member, guild, channel } = message;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    }); 
    const amount: number = wholeNumber(Number(args[1]));
    if (!Number.isInteger(amount) || amount < 10 || amount > 10000 || !amount) return;

    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);
    if (!target || target.id === member!.id) return;
    transferTransaction(member!, target, amount, this.client).then((result) => {
      if (typeof result === "boolean" && !result) {
        // Сообщениео неудаче

        const lose = new Discord.MessageEmbed()
          .setColor(0x36393f)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true })
          )
          .setDescription(`У вас нет столько звёзд.`);

        return channel.send(lose).then((m) => m.delete({ timeout: 15000 }));
      }

      // Сообщение в чат

      const notify = new Discord.MessageEmbed()
        .setColor(0x36393f)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true })
        )
        .setDescription(
          `**Перевод средств!**\n\n${member} передает **${result}**${
          config!.CurrencyLogo
          } пользователю ${target}`
        );

      channel.send(notify);
      // Сообщение упомянотому пользователю в лс

      return target.send(notify).catch(() => { });
    });
  }
}

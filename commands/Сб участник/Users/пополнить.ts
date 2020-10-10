import { Command, Discord, Core } from "discore.js";
import {
  removeExtraSpaces,
  randomInt,
  wholeNumber,
} from "../../../util/functions";
import Constants from "../../../util/Constants";
import { withdrawTransaction } from "../../../Methods/allRelatedToCurrency";
export default class extends Command {
  get options() {
    return {
      name: "сообщество пополнить",
      aliases: "сб пополнить",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Пополнить капитал сообщества",
      syntax: `${this.client.prefix}сб пополнить [сумма]`,
      example: `${this.client.prefix}сб пополнить 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const UserClubDeposits = this.client.db.getCollection("userclubdeposits")!;
    const config = await Configs.getOne({ guildId: message.guild?.id });
    const amount = wholeNumber(Number(args[0]));
    if (!amount) return;
    if (!Number.isInteger(amount) || amount <= 0) return;
    if (amount > 10000) return message.reply(`максимальная сумма пополнения - 10 000${config.CurrencyLogo}`);
    const data = {
      userId: member!.id,
    };
    let user = await Users.findOne(data);
    if (user!.ClubId == null) return;

    const dataClan = {
      ClubId: user!.ClubId,
    };
    let td = await UserClubDeposits.getOne({
      userId: member!.id,
      ClubId: user!.ClubId,
    });
    let clan = await clans.findOne(dataClan);

    if (!clan) return;

    const role = guild!.roles.cache.get(clan.clanRole);

    withdrawTransaction(member!, amount, this.client, Constants.TransactionsTypes[5]).then(async (result) => {
      if (typeof result == "boolean" && !result) {
        const embed = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(
            `У вас недостаточно ${
            config!.CurrencyLogo
            } для пополнения капитала сообщества!`
          )
          .setFooter(
            `Используйте команду - "!получить", чтобы забрать свои ежедневные звёзды!`
          );

        return channel.send(embed);
      } else {
        const balance = Number(clan!.balance + amount);
        const totdep = Number(td.totalDeposit + amount);
        td.totalDeposit = totdep;
        await td.save().catch();
        clan!.balance = balance;
        await clan?.save().catch();

        const embed1 = new Discord.MessageEmbed()
          .setColor(role!.color)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setTitle("Вы успешно пополнили капитал сообщества!")
          .setDescription(
            `Ваш взнос: **${totdep}** звёзд\nОбщая сумма: **${clan!.balance}**${
            config!.CurrencyLogo
            }`
          )
          .setFooter(
            `Чтобы посмотреть остальную информацию, используйте команду - "!сб профиль".`
          )
          .setThumbnail(
            `https://cdn.discordapp.com/attachments/620328811610767370/634085351048347692/giveM.png?size=1024`
          );

        channel.send(embed1);
      }
    });
  }
}

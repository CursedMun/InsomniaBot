import { Command, Discord } from "discore.js";
import {
  withdrawTransaction,
  withdrawTaxs,
} from "../../../Methods/allRelatedToCurrency";
import Constants from "../../../util/Constants";

export default class extends Command {
  get options() {
    return {
      name: "сообщество цвет",
      aliases: "сб цвет",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Поменять цвет сообщества (стоимость: 300 звёзд с капитала)",
      syntax: `${this.client.prefix}сб цвет [[цвет-код](https://html-color-codes.info/Cvetovye-kody-HTML/)]`,
      example: `${this.client.prefix}сб цвет #090909`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const color = args[0];
    if (!color) return;

    const data = {
      userId: member!.id,
    };

    const price = 300;
    let user = await Users.findOne(data);

    if (user!.ClubId == null) return;

    if (!user!.isClubOwner && user!.ClubId !== null) {
      const embed = new Discord.MessageEmbed()
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(`Вы не являетесь владельцем сообщества!`);
      return channel.send(embed);
    } else {
      if (user!.isClubOwner && user!.ClubId !== null) {
        const dataClan = {
          ClubId: user!.ClubId,
        };
        let clan = await clans.findOne(dataClan);
        withdrawTaxs(clan!.ClubId, price, this.client, Constants.ClanTypes[2]).then(
          async (result) => {
            if (typeof result == "boolean" && !result) {
              const embed2 = new Discord.MessageEmbed()
                .setColor(member!.displayColor)
                .setAuthor(
                  member!.displayName,
                  member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                )
                .setDescription(`У сообщества не хватает звёзд!`)
                .setFooter(
                  `Используйте команду - "!сб профиль", чтобы проверить баланс сообщества.`
                );
              return channel.send(embed2);
            } else {
              const role = guild!.roles.cache.get(clan!.clanRole);

              await role!.edit({ color });

              const embed3 = new Discord.MessageEmbed()
                .setColor(role!.color)
                .setAuthor(
                  member!.displayName,
                  member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                )
                .setTitle(`Цвет сообщества изменен!`)
                .setDescription(`Новый цвет ${role} : \`${color}\``);
              return channel.send(embed3);
            }
          }
        );
      } else return;
    }
  }
}

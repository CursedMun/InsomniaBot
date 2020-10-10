import { Command, Discord } from "discore.js";
import { removeExtraSpaces } from "../../../util/functions";
import Constants from "../../../util/Constants";
import {
  withdrawTaxs,
} from "../../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {
      name: "сообщество название",
      aliases: "сб название",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Поменять название сообщества (стоимость: 500 звёзд с капитала)",
      syntax: `${this.client.prefix}сб название [название]`,
      example: `${this.client.prefix}сб название Инсомния💤`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;

    const msgArr = content.split(" ");
    const arg = removeExtraSpaces(msgArr.slice(2));

    const name = arg.join(" ");
    if (!name) return;

    const data = {
      userId: member!.id,
    };

    const price = 500;
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
        if (clan!.status == "LOCKED") {
          const embed1 = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setTitle(`Ошибка!`)
            .setDescription(
              `Ваша сообщество заблокировано за неуплату налогов!\nДанное действие заблокировано!`
            );
          return channel.send(embed1);
        } else {
          withdrawTaxs(clan!.ClubId, price, this.client, Constants.ClanTypes[1]).then(
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
                const text = guild!.channels.cache.get(clan!.clanChat);
                const role = guild!.roles.cache.get(clan!.clanRole);
                await text!.edit({ name });
                await role!.edit({ name });
                await clans.updateOne(dataClan, { name: name });

                const embed3 = new Discord.MessageEmbed()
                  .setColor(role!.color)
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                  )
                  .setTitle(`Название сообщества изменено!`)
                  .setDescription(`Новое название: ${role}`);
                return channel.send(embed3);
              }
            }
          );
        }
      } else return;
    }
  }
}

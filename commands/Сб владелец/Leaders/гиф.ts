import { Command, Discord } from "discore.js";
import Constants from "../../../util/Constants";
import {
  withdrawTaxs,
} from "../../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {
      name: "сообщество изображение",
      aliases: "сб изображение",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help:
        "Изменить гифку/картинку в профиле сообщества (стоимость: 5000 звёзд с капитала)",
      syntax: `${this.client.prefix}сб изображение [ссылка]`,
      example: `${this.client.prefix}сб изображение [ссылка]`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, mentions, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const role = mentions.roles.first() || guild?.roles.cache.get(args[0])
    var expression = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/gi;
    var regex = new RegExp(expression);
    if (role && member?.hasPermission("ADMINISTRATOR")) {
      const data = {
        clanRole: role!.id,
      };
      const clan = await clans.findOne(data);
      if (clan) {
        const embed2 = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(`Успешно удалил картинку сообщество!`)

        await clans.updateOne(data, { gifURL: null });
        return channel.send(embed2);
      } else return
    } else
      if (!args[0]) {
        const data = {
          userId: member!.id,
        };
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
            const embed2 = new Discord.MessageEmbed()
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
              )
              .setDescription(`Успешно удалил картинку сообщество!`)

            await clans.updateOne({
              ClubId: user!.ClubId,
            }, { gifURL: null });
            return channel.send(embed2);
          } else return;
        }
      } else {
        const gif = args[0];
        if (!gif) return;
        if (!gif.match(regex)) return message.reply("неверная ссылка!");

        const data = {
          userId: member!.id,
        };

        const price = 5000;
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

            withdrawTaxs(clan!.ClubId, price, this.client, Constants.ClanTypes[4]).then(
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
                  await clans.updateOne(dataClan, { gifURL: gif });

                  const embed3 = new Discord.MessageEmbed()
                    .setColor("RANDOM")
                    .setAuthor(
                      member!.displayName,
                      member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                    )
                    .setTitle(`Изображение сообщества успешно изменено!`);
                  return channel.send(embed3);
                }
              }
            );

          } else return;
        }
      }

  }
}

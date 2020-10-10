import { Command, Discord } from "discore.js";
import {
  wholeNumber,
} from "../../../util/functions";
import Constants from "../../../util/Constants";
import {
  withdrawTaxs,
} from "../../../Methods/allRelatedToCurrency";
export default class extends Command {
  get options() {
    return {
      name: "сообщество слоты",
      aliases: ["сб слоты", "сб купитьслоты"],
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Купить дополнительные слоты в сообщество",
      syntax: `${this.client.prefix}сб слоты [кол-во]`,
      example: `${this.client.prefix}сб слоты 5`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const amount = wholeNumber(Number(args[0]));
    if (!amount) return
    if (!Number.isInteger(amount)) return;

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
        if (clan!.slots + amount > 20) {
          const embed1 = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({
                dynamic: true,
                size: 2048,
              })
            )
            .setTitle(`Ошибка!`)
            .setDescription(`Достигнут лимит покупки слотов.`);
          return channel.send(embed1);
        } else {
          withdrawTaxs(clan!.ClubId, price * amount, this.client, Constants.ClanTypes[3]).then(
            async (result) => {
              if (typeof result == "boolean" && !result) {
                const embed2 = new Discord.MessageEmbed()
                  .setColor(member!.displayColor)
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({
                      dynamic: true,
                      size: 2048,
                    })
                  )
                  .setDescription(`У сообщества не хватает звёзд!`)
                  .setFooter(
                    `Используйте команду - "!сб профиль", чтобы проверить баланс сообщества.`
                  );
                return channel.send(embed2);
              } else {
                await clans.updateOne(dataClan, {
                  slots: clan!.slots + amount,
                });

                const embed3 = new Discord.MessageEmbed()
                  .setColor("RANDOM")
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({
                      dynamic: true,
                      size: 2048,
                    })
                  )
                  .setTitle(`Слоты успешно куплены`)
                  .setDescription(`Количество купленных слотов: ${amount}`);
                return channel.send(embed3);
              }
            }
          );
        }

      } else return;
    }
  }
}

import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { awardTransaction } from "../../Methods/allRelatedToCurrency";
const roles = {
  3: {
    name: "role3d",
    cost: 250,
  },
  7: {
    name: "role7d",
    cost: 400,
  },
  10: {
    name: "role10d",
    cost: 550,
  },
  20: {
    name: "role20d",
    cost: 1100,
  },
  30: {
    name: "role30d",
    cost: 2000,
  },
};
type SpecialNumber = 3 | 7 | 10 | 20 | 30;
export default class extends Command {
  get options() {
    return {
    };
  }
  get customOptions() {
    return {
      group: "Магазин",
      help: "Обменять личную роль (при наличии) на валюту",
      syntax: `${this.client.prefix}обменять [3/7/10/20/30]`,
      example: `${this.client.prefix}обменять 3`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const user = await this.client.db
      .getCollection("users")
      ?.findOne({ userId: message.author.id });
    const { guild, channel, member } = message;
    const number: number = Number(args[0]);
    if (number != 3 && number != 7 && number != 10 && number != 20 && number != 30) return
    const selected = roles[number];
    if (selected) {
      if (user!.inventory[selected.name].count > 0) {
        message.channel
          .send(
            new Discord.MessageEmbed()
              .setColor(Constants.Colors.Transparent)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ size: 2048, dynamic: true })
              )
              .setDescription(
                `За эту роль вы получите ${selected.cost}\n Вы согласны?`
              )
          )
          .then(async (m) => {
            await m.react("633712359772389386");
            m.react("633712357129977876");

            m.awaitReactions(
              (r, u) =>
                u.id === member!.id &&
                ["633712359772389386", "633712357129977876"].includes(
                  r.emoji.id || r.emoji.name
                ),
              {
                max: 1,
                time: 15 * 1000 * 60,
                errors: ["time"],
              }
            ).then(async (collected) => {
              const reaction = collected.first()!;

              if (
                (reaction.emoji.id || reaction.emoji.name) ===
                "633712359772389386"
              ) {
                user!.inventory[selected.name].count =
                  user!.inventory[selected.name].count - 1;
                await user!.save().catch(console.error);
                message.reply("Done");
                return awardTransaction(member!, selected.cost, this.client);

              } else {
                return message.reply("👍");
              }
            }).catch(collected => {
              return message.reply("👍");
            });
          });
      } else {
        return message.reply("У вас нет покуных ролей")
      }
    } else {
      return message.reply("Впишите правильную цифру");
    }
  }
}

import { Command, Discord, Document } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces } from "../../util/functions";
import { pluralize, unixTime } from "../../util/helpers";
const roles = {
  3: {
    name: "role3d",
    days: 3,
  },
  7: {
    name: "role7d",
    days: 7,
  },
  10: {
    name: "role10d",
    days: 10,
  },
  20: {
    name: "role20d",
    days: 20,
  },
  30: {
    name: "role30d",
    days: 30,
  },
};
interface rolesx {
  3: number,
  7: number,
  10: number,
  20: number,
  30: number
}
export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Магазин",
      help: "Создать (активировать) личную роль",
      syntax: `${this.client.prefix}личнаяроль [дни] [[цвет-код](https://html-color-codes.info/Cvetovye-kody-HTML/)] [название] [[эмоджи](https://getemoji.com/)]`,
      example: `${this.client.prefix}личнаяроль 7 #000000 Cursed`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const user = await this.client.db
      .getCollection("users")
      ?.findOne({ userId: message.author.id });
    const unixes = this.client.db.getCollection("unixes");
    const { guild, channel, member, content } = message;

    const msgArr = content.split(" ");
    const arg = removeExtraSpaces(msgArr.slice(3));

    const name = arg.join(" ");
    if (!name) return;


    const number: number = Number(args[0]);
    if (number != 3 && number != 7 && number != 10 && number != 20 && number != 30) return
    if (!number) return
    const selected = roles[number];

    if (
      !Boolean(args[1].match(/^((0x){0,1}|#{0,1})([0-9A-F]{8}|[0-9A-F]{6})$/gi))
    )
      return;
    const color = args[1];
    if (selected) {
      if (user!.inventory[selected.name].count > 0) {
        const u = (await unixes!.fetch())
          .filter((value: Document) => value.Type == 1 && value.userId == member?.id && value.time > 0)
          .array();

        if (u!.length >= 1) {
          return channel.send(
            new Discord.MessageEmbed()
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true })
              )
              .setDescription(
                `Вы достигли максимальное количество личных ролей.`
              )
          );
        } else {
          const catRole = guild?.roles.cache.get(
            Constants.Ids.ConfigRoles.selfcolorsposition
          );
          guild?.roles
            .create({
              data: {
                name: name,
                color: color,
                position: catRole?.rawPosition,
              },
            })
            .then(async (role) => {
              message.channel
                .send(
                  new Discord.MessageEmbed()
                    .setColor(Constants.Colors.Transparent)
                    .setAuthor(
                      member!.displayName,
                      member!.user.displayAvatarURL({
                        size: 2048,
                        dynamic: true,
                      })
                    )
                    .setDescription(
                      `Так будет выглядеть ваша роль ${role}\n Вы согласны?`
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
                      m.delete();
                      const verify = (await unixes!.fetch())
                        .filter((value: Document) => value.Type == 1 && value.userId == member?.id && value.time > 0)
                        .array();
                      if (verify!.length >= 1) {
                        return channel.send(
                          new Discord.MessageEmbed()
                            .setAuthor(
                              member!.displayName,
                              member!.user.displayAvatarURL({ dynamic: true })
                            )
                            .setDescription(
                              `Вы достигли максимальное количество личных ролей.`
                            )
                        );
                      }
                      const unixestime = unixTime() + 86400 * selected.days;
                      await member!.roles.add(role);
                      await unixes?.insertOne({
                        userId: member!.id,
                        time: unixestime,
                        days: selected.days,
                        role: role.id,
                        Type: 1,
                      });
                      user!.inventory[selected.name].count =
                        user!.inventory[selected.name].count - 1;
                      await user?.save().catch(console.error);
                      return channel.send(
                        new Discord.MessageEmbed().setDescription(
                          `${member}, вы создали личную роль ${role} на ${selected.days
                          } ${pluralize(selected.days, "день", "дня", "дней")}.`
                        )
                      );
                    } else {
                      role.delete("Отказ от роли");
                      return message.reply("Вы отказались");
                    }
                  }).catch(collected => {
                    if (!m) return;
                    role.delete("Отказ от роли");
                    return message.reply("Вы отказались");
                  });
                });
            });
        }
      }
    } else return;
  }
}

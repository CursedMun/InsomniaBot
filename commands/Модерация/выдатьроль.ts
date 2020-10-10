import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { unixTime, convert, randomHexColor } from "../../util/helpers";
const durationMultipliers = {
  s: 1e3,
  m: 6e4,
  h: 3.6e6,
  d: 8.64e7,
  w: 6.048e8,
  с: 1e3,
  м: 6e4,
  ч: 3.6e6,
  д: 8.64e7,
  н: 6.048e8,
};
export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Moderator,
      name: "выдатьроль",
      aliases: ["temprole"]
    };
  }
  get customOptions() {
    return {
      group: "Модерация",
      help: "Выдать роль @user на дни, часы, минуты, секунды",
      syntax: `${this.client.prefix}выдатьроль @user [роль] [дни]`,
      example: `${this.client.prefix}выдатьроль @user @Разработчик 1д/1d `,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member } = message;
    message.delete();
    const Unixes = this.client.db.getCollection("unixes")!;
    const regex = /(\d+)([смчднsmhdw])/;
    if (!args) return;
    const gMatch = args
      .join(" ")
      .match(new RegExp(regex.source, `g${regex.flags}`));
    if (!gMatch)
      return message.channel.send(
        "Команда: выдатьроль <Юзер> (Роль линком или текстом) (Дни: 1d/1д)\nПример команды: выдатьроль <@423946555872116758> <@&572775721101950997> 1д"
      );
    const matches = gMatch.map((m) => m.match(regex)).filter(Boolean);
    if (!matches)
      return message.channel.send(
        "Команда: выдатьроль <Юзер> (Роль линком или текстом) (Дни: 1d/1д)\nПример команды: выдатьроль <@423946555872116758> <@&572775721101950997> 1д"
      );

    let time = 0;
    matches.forEach((element: any) => {
      time +=
        (Number(element![1]) * durationMultipliers[element[2]]) /
        (60 * 60 * 24 * 1000);
    });
    const unixestime = unixTime() + 86400 * time;
    let iprole = message.mentions.roles.first()
      ? message.mentions.roles.first()
      : message.guild!.roles.cache.find((r) =>
        r.name.toLowerCase().includes(args[1])
      );
    if (!iprole)
      return message.channel.send(
        "Команда: выдатьроль <Юзер> (Роль линком или текстом) (Дни: 1d/1д)\nПример команды: выдатьроль <@423946555872116758> <@&572775721101950997> 1д"
      );
    const target =
      message.mentions.members!.first() || guild!.members.cache.get(args[0]);
    if (member!.roles.highest.position < iprole.position)
      return message.channel.send("Недостаточно прав");
    if (!target || target.user.bot) return;

    const targetId = target.id;

    try {
      const timeRole = await Unixes.findOne({ role: iprole.id, userId: targetId, Type: 2 })
      if (timeRole) {
        timeRole.time = timeRole.time + (86400 * time);
        await timeRole.save().catch(console.error)
      } else {
        await Unixes.insertOne({
          userId: targetId,
          time: unixestime,
          role: iprole.id,
          Type: 2,
        });
      }

      const embed = new Discord.MessageEmbed()
        .setColor(randomHexColor())
        .setDescription(
          `${target} получает роль ${iprole} до ${convert(
            unixestime
          )}<a:done:633677830907101216>`
        );
      await target.roles.add(iprole);
      return channel.send(embed);
    } catch (e) {
      console.error(e);
    }
  }
}

import { Command, Discord, Document } from "discore.js";
import Constants from "../../util/Constants";
import ms from "ms";
import { unixTime, convert } from "../../util/helpers";
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
      aliases: "вц"
    };
  }
  get customOptions() {
    return {
      group: "Модерация",
      help: "Выдать временный цвет @user (дни, часы, минуты, секунды)",
      syntax: `${this.client.prefix}выдатьцвет/вц @user [[цвет-код](https://html-color-codes.info/Cvetovye-kody-HTML/)] 1d 1h 1m 1s `,
      example: `${this.client.prefix}выдатьцвет @user #090909 1д`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member } = message;
    message.delete();
    const Unixes = this.client.db.getCollection("unixes")!;
    if (args[1] && args[1].toLowerCase() === "снять") {
      const target =
        message.mentions.members!.first() || guild!.members.cache.get(args[0]);
      if (!target || target.user.bot) return;
      const user = await Unixes.findOne({
        where: { userId: target.id, Type: 3 },
      })!;
      if (!user) return;
      let role = guild!.roles.cache.find((r) => r.id === user.role);
      if (!role) return;
      try {
        await Unixes.deleteOne({ where: { userId: user.userId, Type: 3 } });
        await role.delete();
      } catch (error) {
        console.log(error);
      }
    } else {
      const regex = /(\d+)([смчднsmhdw])/;
      if (!args) return;
      const gMatch = args
        .join(" ")
        .match(new RegExp(regex.source, `g${regex.flags}`));
      if (!gMatch)
        return
      const matches = gMatch.map((m) => m.match(regex)).filter(Boolean);
      if (!matches)
        return

      if (!args[1].match(/^#[0-9a-f]{6}(?:[0-9a-f]{6})?$/i))
        return
      const target =
        message.mentions.members!.first() || guild!.members.cache.get(args[0]);
      if (!target || target.user.bot) return;
      let time = 0;
      matches.forEach((element) => {
        time +=
          (Number(element![1]) * durationMultipliers[element[2]]) /
          (60 * 60 * 24 * 1000);
      });

      const targetId = target.id;

      await guild!.roles
        .create({
          data: {
            name: "INsomniaColor",
            color: `${args[1]}`,
            mentionable: false,
            position: guild!.roles.cache.get(
              Constants.Ids.ConfigRoles.colorsposition
            )?.rawPosition,
          },
        })
        .then(async (r) => {
          await target.roles.add(r);
          const unixestime = unixTime() + 86400 * time;
          await Unixes.insertOne({
            userId: targetId,
            time: unixestime,
            role: r.id,
            Type: 3,
          })
            .save()
            .catch((e) => console.log(e));

          const embed = new Discord.MessageEmbed()
            .setColor(r.color)
            .setDescription(
              `${target} получает цвет ${r} до ${convert(
                unixestime
              )}<a:done:633677830907101216>`
            )
            .setFooter(
              `Если цвет находится в самом низу профиля, обратитесь к администрации!`
            );
          return channel.send(embed);
        });
    }
    return;
  }
}

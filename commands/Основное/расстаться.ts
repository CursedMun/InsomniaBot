import { Command, Discord, Document } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get customOptions() {
    return {
      group: "Основное",
      help: "Разорвать текущую пару",
      syntax: `${this.client.prefix}расстаться`,
      example: `${this.client.prefix}расстаться`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const Users = this.client.db.getCollection("users")!;
    const LoveTaxs = this.client.db.getCollection("LoveTaxs")!;
    const LoveRoom = this.client.db.getCollection("voiceconfigs")
    const data = {
      userId: message.member!.id,
    };
    const user = await Users.findOne(data);
    if (user!.relationship == null)
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setDescription(`${message.author}, у вас нет пары.`)
      );
    const newMsg = await message.author.send(
      new Discord.MessageEmbed()
        .setColor("#ce2626")
        .setDescription(
          `${message.author}, уверены?\n\n<:Yes:633712359772389386> - Да\n\n<:No:633712357129977876> - Нет`
        )
        .setFooter("Поторопись! У тебя есть всего 5 минут на ответ.")
    );

    await newMsg.react("633712359772389386").catch(console.error);
    await newMsg.react("633712357129977876").catch(console.error);

    newMsg
      .awaitReactions(
        (r, u) =>
          u.id === message.member!.id &&
          ["633712359772389386", "633712357129977876"].includes(
            r.emoji.id || r.emoji.name
          ),
        {
          max: 1,
          time: 5 * 1000 * 60,
          errors: ["time"],
        }
      )
      .then(async (collected) => {
        const reaction = collected.first()!;

        if (
          (reaction.emoji.id || reaction.emoji.name) === "633712359772389386"
        ) {
          const data1 = {
            userId: user!.relationship,
          };
          const scndperson = await Users.findOne(data1);

          const scndusr = message.guild?.members.cache.get(user!.relationship)!;
          await LoveTaxs.deleteOne((d: Document) => d.idone == user!.userId || d.idscnd == user!.userId)?.catch(console.error);
          await LoveRoom?.deleteOne(((d: Document) => d.id == message.author.id && d.type == 1 || d.idScnd == message.author.id && d.type == 1))?.catch(console.error);
          user!.relationship = null;
          user!.relationshipRoleID = null;
          scndperson!.relationship = null;
          scndperson!.relationshipRoleID = null;
          await user!.save().catch(console.error);
          await scndperson!.save().catch(console.error);

          newMsg.delete();
          await scndusr.roles.remove(Constants.Ids.Roles.Users.LoveRole).catch(console.error)
          await message.member!.roles.remove(Constants.Ids.Roles.Users.LoveRole).catch(console.error)
          scndusr.send(
            new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setDescription("Пара разорвана.")
          );
          return message.author.send(
            new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setDescription("Пара разорвана.")
          );
        } else {
          return message.author
            .send(
              new Discord.MessageEmbed()
                .setColor("#ce2626")
                .setDescription(`${message.author}, принято!`)
            )
            .then((m) => m.delete({ timeout: 15000 }));
        }
      });
  }
}

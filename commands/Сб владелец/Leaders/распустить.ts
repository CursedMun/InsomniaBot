import { Command, Discord, Document } from "discore.js";

export default class extends Command {
  get options() {
    return {
      name: "сообщество распустить",
      aliases: "сб распустить",
    };
  }
  get customOptions() {
    return {
      group: "Сообщество для владельцев",
      help: "Распустить сообщество",
      syntax: `${this.client.prefix}сб распустить`,
      example: `${this.client.prefix}сб распустить`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const taxs = this.client.db.getCollection("clantaxs")!;
    const data = {
      userId: member!.id,
    };
    let user = await Users.findOne(data);

    if (user!.ClubId == null) return;

    if (user!.isClubOwner == 0) {
      const embed = new Discord.MessageEmbed()
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(`Вы не являетесь владельцем сообщества!`);
      return channel.send(embed);
    } else {
      const dataClan = {
        ClubId: user!.ClubId,
      };
      let clan = await clans.findOne(dataClan);

      const role = guild!.roles.cache.get(clan!.clanRole);
      const text = guild!.channels.cache.get(clan!.clanChat);

      const embed1 = new Discord.MessageEmbed()
        .setColor(role!.color)
        .setDescription(
          `Вы уверены, что хотите распустить сообщество?\nПотраченное время и средства не восстановить!:relieved:\n<:Yes:633712359772389386> - да, распускайте.\n<:No:633712357129977876> - нет, я передумал!`
        )
        .setThumbnail(
          `https://media.discordapp.net/attachments/620328811610767370/633711627765678080/commq.png?size=1024`
        );
      member!.send(embed1).then(async (m) => {
        await m.react(`633712359772389386`);
        await m.react(`633712357129977876`);

        const filter = (react: Discord.MessageReaction, user: Discord.GuildMember) =>
          (react.emoji.id == "633712359772389386" ||
            react.emoji.id == "633712357129977876") &&
          user.id == member!.id;
        const collector = m.createReactionCollector(filter, {
          time: 60000,
        });

        collector.on("collect", async (reaction) => {
          if (reaction.emoji.id == "633712359772389386") {
            m.delete();
            const members = await Users.filter(
              (value: Document) => value.ClubId === clan!.ClubId
            );
            members.forEach(async (m: Document) => {
              m.ClubId = null
              m.isClubOwner = 0;
              await m.save().catch()
            })
            await taxs.deleteOne({ ClubId: clan!.ClubId });
            await clans.deleteOne({ ClubId: clan!.ClubId });

            role!.delete();
            text!.delete();

            const succes = new Discord.MessageEmbed()
              .setColor(role!.color)
              .setTitle(`Ваше сообщество успешно распущено.`);
            member!.send(succes);
          } else if (reaction.emoji.id == "633712357129977876") {
            m.delete();
          }
        });
        collector.on("end", reaction => {
          m.delete();
          const embed2 = new Discord.MessageEmbed()
            .setColor(role!.color)
            .setDescription(`Вы не подтвердили своё действие😌`);
          return member!.send(embed2);
        })
      });

    } return

  }
}

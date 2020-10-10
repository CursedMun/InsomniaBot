import { Command, Discord, Document } from "discore.js";

export default class extends Command {
  get options() {
    return {
      name: "сообщество отклонить",
      aliases: "сб отклонить",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Отклонить заявку @user на вступление в сообщество",
      syntax: `${this.client.prefix}сб отклонить @user`,
      example: `${this.client.prefix}сб отклонить @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild, mentions } = message;
    const selected = args[0];
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const requests = this.client.db.getCollection("unixes")!;
    const target =
      mentions.members!.first() || guild!.members.cache.get(args[1]);
    if (!target) return;

    const data = {
      userId: member!.id,
    };

    const dataClan = {
      owner: member!.id,
    };
    const user = await Users.findOne(data);
    if (user!.isClubOwner && user!.ClubId !== null) {
      let req = await requests.findOne((r: Document) => r.userId == target!.id && r.ClubId != null);
      if (!req) {
        const embed1 = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(
            `Пользователь ${target}, не отправлял заявку, либо время уже истекло!!`
          );
        return channel.send(embed1);
      } else {
        if (req.ClubId == user!.ClubId) {
          let clan = await clans.findOne(dataClan);
          if (!clan) return;

          const embed3 = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(
              `Вы отклонили заявку ${target} на вступление в сообщество`
            );
          channel.send(embed3);

          const role = guild!.roles.cache.get(clan.clanRole);
          await requests.deleteOne((r: Document) => r.userId == target!.id && r.ClubId != null)

          const embed4 = new Discord.MessageEmbed()
            .setColor(role!.color)
            .setAuthor(
              target.displayName,
              target.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(
              `Увы, но ваша заявка на вступление в \`"${clan.name}"\` была отклонена 😰 Попробуйте подать её снова позже, либо вступить в другое сообщество!`
            )
            .setThumbnail(
              `https://images-ext-2.discordapp.net/external/16xuIJrsUFv_ymWgxFXXJqp5iONF772OJyJGpzfyDcE/https/media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`
            );

          return target.send(embed4);
        } else return;
      }
    } else return;

  }
}

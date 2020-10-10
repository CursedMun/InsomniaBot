import { Command, Discord } from "discore.js";

export default class extends Command {
  get options() {
    return {
      name: "сообщество передать",
      aliases: "сб передать",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Передать владение сообществом @user",
      syntax: `${this.client.prefix}сб передать @user`,
      example: `${this.client.prefix}сб передать @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, mentions, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const target =
      mentions.members!.first() || guild!.members.cache.get(args[1]);
    if (!target) return;

    const data = {
      userId: target.id,
    };

    const dataMe = {
      userId: member!.id,
    };

    const embed = new Discord.MessageEmbed();

    const role = mentions.roles.first() || guild!.roles.cache.get(args[2]);
    let user = await Users.findOne(data);
    let me = await Users.findOne(dataMe);
    if (!role) {
      if (me!.isClubOwner == 0 && me!.ClubId == null) return;
      if (user!.ClubId == null) return;
      else {
        if (me!.isClubOwner == 1) {
          if (user!.ClubId !== me!.ClubId) {
            embed
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
              )
              .setDescription(
                `Данный пользователь находится в другом сообществе!`
              );
          } else {
            const dataClan = {
              ClubId: me!.ClubId,
            };
            me!.isClubOwner = 0;
            user!.isClubOwner = 1;
            await me?.save().catch();
            await user?.save().catch();
            let clan = await clans.updateOne(dataClan, { owner: target.id })!.catch(
              console.error
            );
            let textch = guild!.channels.cache.get(clan.clanChat) as Discord.TextChannel
            textch.overwritePermissions([
              {
                id: target.id,
                allow: ['MANAGE_MESSAGES'],
              },
              {
                id: clan.clanRole,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
              },
              {
                id: guild!.id,
                deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
              }
            ], 'Needed to change permissions')
            embed
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
              )
              .setDescription(
                `Вы передали владение сообществом пользователю ${target}`
              );
          }
        } else {
          embed
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(`Вы не являетесь владельцем сообщества!`);
        }
        return channel.send(embed).catch(console.error);
      }
    } else {
      if (member?.hasPermission("ADMINISTRATOR")) {
        const dataClan = {
          clanRole: role.id,
        };
        let clan = await clans.findOne(dataClan);

        if (!clan) return;

        if (!user!.isClubOwner) {
          const dataOld = {
            id: clan.owner,
          };

          const dataClan = {
            ClubId: me!.ClubId,
          };
          user!.isClubOwner = 1;
          user!.ClubId = clan.ClubId;

          await user?.save().catch(console.error);
          await Users.updateOne(dataOld, { isClubOwner: 0 })!.catch(
            console.error
          );
          await clans.updateOne(dataClan, { owner: target.id })!.catch(
            console.error
          );

          embed
            .setColor(member.displayColor)
            .setAuthor(
              member.displayName,
              member.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(
              `Вы передали владение сообществом ${role} пользователю ${target}`
            );
        } else {
          embed
            .setColor(member.displayColor)
            .setAuthor(
              member.displayName,
              member.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(
              `Данный пользователь уже является владельцем сообщества!`
            );
        }

        return channel.send(embed).catch(console.error);
      } else return;
    }
  }
}

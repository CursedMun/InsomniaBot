import { Command, Discord } from "discore.js";

export default class extends Command {
  get options() {
    return {
      name: "сообщество кик",
      aliases: "сб кик",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Исключить @user из сообщества",
      syntax: `${this.client.prefix}сб кик @user`,
      example: `${this.client.prefix}сб кик @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild, mentions } = message;
    const selected = args[0];
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const taxs = this.client.db.getCollection("clantaxs")!;
    const config = await Configs.getOne({ guildId: message.guild?.id });

    const target =
      mentions.members!.first() || guild!.members.cache.get(args[1]);
    if (!target) return;
    if (target.id == member!.id)
      return message.reply("Ошибка!").then((m) => m.delete({ timeout: 10000 }));
    const data = {
      userId: member!.id,
    };

    const dataTarget = {
      userId: target.id,
    };

    const dataClan = {
      owner: member!.id,
    };

    const embed5 = new Discord.MessageEmbed();
    let user = await Users.findOne(data);
    let tag = await Users.findOne(dataTarget);
    let clan = await clans.findOne(dataClan);

    if (!user!.ClubId) return;
    if (!tag!.ClubId) {
      embed5
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(
          `Пользователь с данным никнеймом не состоит в вашем сообществе.`
        );
      return channel.send(embed5);
    } else {
      if (!user!.isClubOwner && user!.ClubId !== null) {
        if (user!.ClubId !== null) {
          const embed = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(`Вы не являетесь владельцем сообщества!`);
          return channel.send(embed);
        } else return;
      } else {
        if (user!.isClubOwner && user!.ClubId !== null) {
          if (tag!.ClubId !== null) {
            const role = guild!.roles.cache.get(clan!.clanRole)!;
            const clanChat = guild!.channels.cache.get(
              clan!.clanChat
            ) as Discord.TextChannel;
            if (!clan) return;

            await target.roles.remove(role);

            await Users.updateOne(dataTarget, { ClubId: null });

            const embed2 = new Discord.MessageEmbed()
              .setColor(role.color)
              .setDescription(
                `${target} кикнут из сообщества!\n+1 свободное место 😌`
              );
            clanChat!.send(embed2);
            const embed3 = new Discord.MessageEmbed()
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
              )
              .setDescription(
                `Пользователь ${target} был изгнан из сообщества \`"${clan.name}"\` Похоже придётся подыскать себе новое...`
              )
              .setThumbnail(
                `https://media.discordapp.net/attachments/620328811610767370/633709188819976192/commX.png?size=1024`
              );
            channel.send(embed3);

            const embed4 = new Discord.MessageEmbed()
              .setColor(role.color)
              .setDescription(
                `Вы были изгнаны из сообщества \`"${
                clan.name
                }"!\`... Но ничего, вы же можете создать своё за **1500**${
                config!.CurrencyLogo
                }!`
              )
              .setThumbnail(
                `https://media.discordapp.net/attachments/620328811610767370/633709188819976192/commX.png?size=1024`
              )
              .setFooter(
                `Для создания используйте команду - "!сб создать [цвет] [название] [эмоджи]"`
              );

            return target.send(embed4);
          } else {
            embed5
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
              )
              .setDescription(
                `Пользователь с данным никнеймом не состоит в вашем сообществе.`
              );
            return channel.send(embed5);
          }
        } else return;
      }
    }
  }
}

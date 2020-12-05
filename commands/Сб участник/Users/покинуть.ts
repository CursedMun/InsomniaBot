import { Command, Discord } from "discore.js";

export default class extends Command {
  get options() {
    return {
      name: "сообщество покинуть",
      aliases: "сб покинуть",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Покинуть сообщество",
      syntax: `${this.client.prefix}сб покинуть`,
      example: `${this.client.prefix}сб покинуть`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const data = {
      userId: member!.id,
    };

    const embed = new Discord.MessageEmbed();
    const embed1 = new Discord.MessageEmbed();
    let user = await Users.findOne(data);

    const dataClan = {
      ClubId: user!.ClubId,
    };
    let clan = await clans.findOne(dataClan);

    if (user!.ClubId == null) return;

    if (user!.isClubOwner && user!.ClubId !== null) {
      embed
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(
          `Владелец сообщества не может покинуть свое сообщество!`
        );
    } else {
      user!.ClubId = null;
      await user!.save().catch(console.error)
      await member!.roles.remove(clan!.clanRole);

      embed
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setTitle("Вы покинули сообщество!")
        .setDescription(`Теперь у вас есть возможно вступить в новое 😌`);
      embed1
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(`${member} покинул сообщество.\n+1 свободное место 😌`);
    }
    const channelx = guild!.channels.cache.get(
      clan!.clanChat
    )! as Discord.TextChannel;
    await channelx.send(embed1).catch(console.error);
    return channel.send(embed).catch(console.error);
  }
}

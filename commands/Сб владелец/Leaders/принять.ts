import { Command, Discord, Document } from "discore.js";

export default class extends Command {
  get options() {
    return {
      name: "сообщество принять",
      aliases: "сб принять",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Принять @user в сообщество",
      syntax: `${this.client.prefix}сб принять @user`,
      example: `${this.client.prefix}сб принять @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild, mentions } = message;
    const selected = args[0];
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const requests = this.client.db.getCollection("unixes")!;
    const config = await Configs.getOne({ guildId: message.guild?.id });
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
      const close = await clans.findOne({ owner: member!.id })!;
      const req = await requests.findOne({
        userId: target.id,
        ClubId: user!.ClubId,
      });
      if (req == null) {
        const embed1 = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(
            `Пользователь ${target}, не отправлял заявку, либо время уже истекло!`
          );
        return channel.send(embed1);
      } else {
        const members = (await Users.fetch())
          .filter((value: Document) => value.ClubId === req.ClubId)
          .array();
        if (members.length == close!.slots) {
          const embed = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setTitle(`Ошибка!`)
            .setDescription(`Данное сообщество переполнено`);
          return channel.send(embed);
        }
        let clan = await clans.findOne(dataClan);

        if (!clan) return;
        let clanChat = guild!.channels.cache.get(
          clan.clanChat
        ) as Discord.TextChannel;
        const embed3 = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(`${member}, вы приняли ${target} в сообщество!`);
        channel.send(embed3);

        const dataAccept = {
          userId: target.id,
        };

        const role = guild!.roles.cache.get(clan.clanRole);
        await target.roles.add(role!);
        await requests.deleteOne((r: Document) => r.userId == target!.id && r.ClubId != null)
        await Users.updateOne(dataAccept, { ClubId: clan.ClubId });
        const embed4 = new Discord.MessageEmbed()
          .setColor(role!.color)
          .setAuthor(
            target.displayName,
            target.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(
            `**Приветствуем** в "${clan.name}", ${target}\n\nТеперь вам доступен локальный чат сообщества и возможность создавать премиум войсы в категории "Социум"`
          );
        clanChat!.send(embed4);
        const embed5 = new Discord.MessageEmbed()
          .setColor(role!.color)
          .setAuthor(
            target.displayName,
            target.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(
            `**Поздравляем**, вас приняли в сообщество \`"${clan.name}"\`\n\nС этого момента вам доступна функция приватных голосовых каналов и чатов в категории "Социум"\nВидеть и писать в приватный чат могут только участники данного сообщества, причём постоянно!😌`
          )
          .setFooter(
            `Используйте команду - "!сб пополнить [сумма]", чтобы сделать свой взнос в общий капитал!`
          )
          .setThumbnail(
            `https://images-ext-2.discordapp.net/external/16xuIJrsUFv_ymWgxFXXJqp5iONF772OJyJGpzfyDcE/https/media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`
          );
        return target.send(embed5);
      }
    } else return;
  }
}

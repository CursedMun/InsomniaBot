import { Command, Discord, Document } from "discore.js";
import { removeExtraSpaces, randomInt } from "../../../util/functions";
import Constants from "../../../util/Constants";
import { withdrawTransaction } from "../../../Methods/allRelatedToCurrency";
import moment from "moment-timezone";
import { unixTime } from "../../../util/helpers";

export default class extends Command {
  get options() {
    return {
      name: "сообщество профиль",
      aliases: "сб профиль",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Посмотреть профиль сообщества",
      syntax: `${this.client.prefix}сб профиль [@сообщество/id сообщества]`,
      example: `${this.client.prefix}сб профиль @Insomnia`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, mentions, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const taxs = this.client.db.getCollection("clantaxs")!;
    const config = await Configs.getOne({ guildId: message.guild?.id });
    try {
      const role = mentions.roles.first() || guild!.roles.cache.get(args[0]);

      const embed = new Discord.MessageEmbed();

      if (!role) {
        const usertoFind = mentions.members?.first() || guild?.members.cache.get(args[0])
        const data = {
          userId: usertoFind ? usertoFind.id : member!.id,
        };

        let user = await Users.findOne(data);
        if (user!.ClubId == null) {
          embed
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(`Вы не состоите ни в одном сообществе!`);
          return channel.send(embed);
        } else {
          const dataClan = {
            ClubId: user!.ClubId,
          };
          let clan = await clans.findOne(dataClan);

          const role = guild!.roles.cache.get(clan!.clanRole);
          const owner = guild!.members.cache.get(clan!.owner);
          const members = (await Users.fetch())
            .filter((value: Document) => value.ClubId === clan!.ClubId)
            .array();

          embed
            .setColor(role!.color)
            .setTitle(`Профиль сообщества "${clan!.name}"`)
            .addField(`Владелец сообщества`, `${owner}`, true)
            .addField(`Дата создания`, `\`${clan!.DateCreated}\``, true)
            .addField(
              `Кол-во участников`,
              `**${members.length}**/**${clan!.slots}**`,
              true
            )
            .addField(
              `Капитал сообщества`,
              `**${clan!.balance}**${config!.CurrencyLogo}`,
              true
            )
            .setImage(
              clan!.gifURL ? clan!.gifURL : `https://i.imgur.com/d4clsje.gif`
            );
          return channel.send(embed);
        }
      } else {
        const data = {
          clanRole: role.id,
        };
        let clan = await clans.findOne(data);

        if (!clan) return;

        const owner = guild!.members.cache.get(clan.owner);
        const members = (await Users.fetch())
          .filter((value: Document) => value.ClubId === clan!.ClubId)
          .array();

        embed
          .setColor(role.color)
          .setTitle(`Профиль сообщества [${clan.name}]`)
          .addField(`Владелец сообщества`, `${owner}`, true)
          .addField(`Дата создания`, `\`${clan.DateCreated}\``, true)
          .addField(
            `Кол-во участников`,
            `**${members.length}**/**${clan.slots}**`,
            true
          )
          .addField(
            `Капитал сообщества`,
            `**${clan.balance}**${config!.CurrencyLogo}`,
            true
          )
          .setImage(
            clan.gifURL ? clan.gifURL : `https://i.imgur.com/d4clsje.gif`
          );
        return channel.send(embed);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

import { Command, Discord } from "discore.js";
import { removeExtraSpaces, randomInt } from "../../../util/functions";
import Constants from "../../../util/Constants";
import { withdrawTransaction } from "../../../Methods/allRelatedToCurrency";
import moment from "moment-timezone";
import { unixTime } from "../../../util/helpers";

export default class extends Command {
  get options() {
    return {
      name: "сообщество создать",
      aliases: "сб создать",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Создать сообщество (стоимость: 1500 Звёзд)",
      syntax: `${this.client.prefix}сб создать [[цвет-код](https://html-color-codes.info/Cvetovye-kody-HTML/)] [название] [[эмоджи](https://getemoji.com/)]`,
      example: `${this.client.prefix}сб создать #090909 Инсомния💤`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const taxs = this.client.db.getCollection("clantaxs")!;
    const config = await Configs.getOne({ guildId: message.guild?.id });
    const dataUser = {
      userId: member!.id,
    };
    const user = await Users.getOne(dataUser)!;
    const isClan = user.isClubOwner;

    if ((isClan == 1 && user.ClubId !== null) || user.ClubId !== null) {
      const embed = new Discord.MessageEmbed()
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(
          `Вы уже владеете сообществом, либо находитесь в другом!`
        );
      return channel.send(embed);
    } else {
      const msgArr = content.split(" ");
      const arg = removeExtraSpaces(msgArr.slice(3));

      const name = arg.join(" ");
      if (!name) return;

      const HexColor = args[0];
      if (!HexColor) return;

      const ClubId = randomInt(100000000, 999999999);
      const price = 1500;

      const catRole = guild!.roles.cache.get(
        Constants.Ids.ConfigRoles.clanposition
      )!.rawPosition;

      withdrawTransaction(member!, price, this.client, Constants.TransactionsTypes[6]).then((result) => {
        if (typeof result == "boolean" && !result) {
          const embed1 = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setDescription(
              `У вас недостаточно ${
              config!.CurrencyLogo
              } для создания сообщества!`
            );
          return channel.send(embed1);
        } else {
          guild!.roles
            .create({
              data: {
                name,
                color: HexColor,
                position: catRole,
              },
            })
            .then(async (role) => {
              const embed2 = new Discord.MessageEmbed()
                .setColor(role.color)
                .setAuthor(
                  member!.displayName,
                  member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                )
                .setTitle(`Сообщество успешно создано!`)
                .setDescription(`Роль: ${role}\nВладелец сообщества: ${member}`)
                .setThumbnail(
                  `https://media.discordapp.net/attachments/620328811610767370/632969186242723840/3db13cfa0fd7d6df.png`
                );
              channel.send(embed2).then(async (message) => {
                const DateCreated = moment(message.createdAt)
                  .tz("Europe/Moscow")
                  .format("HH:mm DD-MM-YYYY");
                const data = {
                  userId: member!.id,
                };
                await clans.insertOne({
                  name: name,
                  owner: member!.id,
                  clanRole: role.id,
                  DateCreated: DateCreated,
                  ClubId: ClubId,
                })
                  .save()
                  .catch((e) => console.log(e));
                user.ClubId = ClubId;
                user.isClubOwner = 1;
                return await user.save().catch(console.error)
              });

              await member!.roles.add(role);
              await role.setMentionable(true);
              guild!.channels
                .create(`${name}`, {
                  type: "text",
                  parent: Constants.Ids.Chs.Clan.parentID,
                })
                .then(async (text) => {
                  await clans.updateOne(
                    { ClubId: ClubId },
                    {
                      clanChat: text.id,
                    }
                  );
                  text.setNSFW(true);
                  text.createOverwrite(guild!.id, {
                    VIEW_CHANNEL: false,
                  });
                  text.createOverwrite(member!.id, {
                    MANAGE_MESSAGES: true,
                  });
                  text.createOverwrite(Constants.Ids.Roles.MiscRoles.muted, {
                    SEND_MESSAGES: false,
                  });
                  const room = guild!.channels.cache.get(
                    Constants.Ids.Chs.Clan.channel
                  );
                  await room?.createOverwrite(role, {
                    VIEW_CHANNEL: true,
                    CONNECT: true,
                  });
                  text.send(
                    member,
                    new Discord.MessageEmbed()
                      .setColor("53380")
                      .setTitle("Сообщество создано")
                      .setDescription(
                        "Теперь вам доступен закрытый чат вашего сообщества. Все бот-команды сообщества так же работают и в этом чате." +
                        "\n\nДля вызова списка команд используйте **!помощь сообщества** вся остальная информация [ТУТ](https://discordapp.com/channels/508698707861045248/605182330411155456/649285897031778319)" +
                        "\n\n***Владелец сообщества может модерировать этот чат. ***"
                      )
                  );
                  return text.createOverwrite(role, {
                    VIEW_CHANNEL: true,
                  });
                });
              const unixestime = unixTime() + 2505600;

              return await taxs
                .insertOne({
                  ClubId: ClubId,
                  time: unixestime,
                  stage: 0,
                })
                .save()
                .catch((e) => console.log(e));
            });
        }
      });
    }
  }
}

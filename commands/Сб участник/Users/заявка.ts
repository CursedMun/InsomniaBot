import { Command, Discord, Document } from "discore.js";
import {
  removeExtraSpaces,
  randomInt,
  convertUnixToTime,
} from "../../../util/functions";
import Constants from "../../../util/Constants";
import { withdrawTransaction } from "../../../Methods/allRelatedToCurrency";
import moment from "moment-timezone";
import { unixTime } from "../../../util/helpers";

export default class extends Command {
  get options() {
    return {
      name: "сообщество заявка",
      aliases: "сб заявка",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Подать заявку на вступление в сообщество",
      syntax: `${this.client.prefix}сб заявка [@сообщество/id сообщества]`,
      example: `${this.client.prefix}сб заявка @Insomnia`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content, mentions } = message;
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const requests = this.client.db.getCollection("unixes")!;
    const role = mentions.roles.first() || guild!.roles.cache.get(args[0]);
    if (!role) return;
    const data = {
      userId: member!.id,
    };

    const dataClan = {
      clanRole: role.id,
    };

    let user = await Users.findOne(data)!;

    let clan = await clans.findOne(dataClan);
    if (!clan) {
      const embed = new Discord.MessageEmbed()
        .setColor(member!.displayColor)
        .setAuthor(
          member!.displayName,
          member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setDescription(`Сообщество ${role} не найдено!`);
      return channel.send(embed);
    } else {
      if (
        user!.ClubId !== null
      ) {
        const embed1 = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setAuthor(
            member!.displayName,
            member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .setDescription(`Вы уже находитесь в сообществе!`);
        return channel.send(embed1);
      } else {
        let req = await requests.findOne((r: Document) => r.userId == member!.id && r.ClubId != null);
        let close = await clans.findOne({ clanRole: role.id });

        const members = (await Users.fetch())
          .filter((value: Document) => value.ClubId === close!.ClubId)
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
        } else {
          if (req) {
            if (unixTime() >= req.time) {
              const unixestime = unixTime() + 86400 * 1;
              const time = convertUnixToTime(req.time);
              let through = "";
              if (time.hour >= 1 && time.hour <= 24)
                through += `${time.hour} ч.`;
              else if (time.min > 0 && time.min <= 60)
                through += `${time.min} м.`;
              else if (time.sec > 0 && time.sec <= 60)
                through += `${time.sec} с.`;
              req.time = unixestime;
              req.ClubId = clan.ClubId;

              await req.save().catch(console.error);

              const owner = guild!.members.cache.get(clan.owner);

              // Сообщение в чат

              const embed4 = new Discord.MessageEmbed()
                .setColor(role.color)
                .setAuthor(
                  member!.displayName,
                  member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                )
                .setDescription(
                  `Ваша заявка отправлена создателю сообщества на рассмотрение!\nОжидайте ответа😴 ${through}`
                )
                .setThumbnail(
                  `https://images-ext-1.discordapp.net/external/nm17v9zPv9as-tt81-V7TnwiLilxX3TdY1zm78p4HR0/https/images-ext-2.discordapp.net/external/HKWZDKWxBWYCADf6kgE3z2vz29jPpxgY6T98DdF8Xrk/https/media.discordapp.net/attachments/620328811610767370/632969186242723840/3db13cfa0fd7d6df.png`
                );
              channel.send(embed4);

              //#region Сообщение владельцу

              await owner!
                .send(
                  new Discord.MessageEmbed()
                    .setColor(role.color)
                    .setTitle(` Так-так...`)
                    .setDescription(
                      `${member} хочет вступить в ваше сообщество! Используйте команду - \`"!сб принять @участник"\` или\n\`"!сб отклонить @участник"\` в зависимости от вашего решения.`
                    )
                    .setFooter(`Выбранную команду пропишите во 🤖┃флуд-боты`)
                    .setThumbnail(
                      `https://media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`
                    )
                )
                .then(async (m) => {
                  await m.react(`633712359772389386`);
                  await m.react(`633712357129977876`);
                  const filter = (
                    react: Discord.MessageReaction,
                    user: Discord.GuildMember
                  ) =>
                    (react.emoji.id == "633712359772389386" ||
                      react.emoji.id == "633712357129977876") &&
                    user.id == owner!.id;
                  const collector = m.createReactionCollector(filter, {
                    time: 3600000,
                  });
                  m.delete({ timeout: 3600000 }).then(() => { });
                  collector.on("collect", async (reaction) => {
                    if (
                      (reaction.emoji.id || reaction.emoji.name) ==
                      "633712359772389386"
                    ) {
                      const target = member;
                      const dataClan = {
                        owner: owner!.id,
                      };

                      const members = (await Users.fetch())
                        .filter((value: Document) => value.ClubId === close!.ClubId)
                        .array();
                      if (members.length == close!.slots) {
                        const embed = new Discord.MessageEmbed()
                          .setColor(member!.displayColor)
                          .setAuthor(
                            member!.displayName,
                            member!.user.displayAvatarURL({
                              dynamic: true,
                              size: 2048,
                            })
                          )
                          .setTitle(`Ошибка!`)
                          .setDescription(`Данное сообщество переполнено`);
                        return owner!.send(embed);
                      }
                      let clan = await clans.findOne(dataClan);

                      if (!clan) return;
                      let clanChat = guild!.channels.cache.get(
                        clan.clanChat
                      ) as Discord.TextChannel;
                      const embed3 = new Discord.MessageEmbed()
                        .setColor(owner!.displayColor)
                        .setAuthor(
                          owner!.displayName,
                          owner!.user.displayAvatarURL({
                            dynamic: true,
                            size: 2048,
                          })
                        )
                        .setDescription(
                          `${owner}, вы приняли ${target} в сообщество!`
                        );
                      owner!.send(embed3);

                      const role = guild!.roles.cache.get(clan.clanRole);

                      const dataAccept = {
                        userId: target!.id,
                      };

                      await target!.roles.add(role!);
                      await requests.deleteOne((r: Document) => r.userId == target!.id && r.ClubId != null)
                      await Users.updateOne(dataAccept, {
                        ClubId: clan.ClubId,
                      });
                      const embed4 = new Discord.MessageEmbed()
                        .setColor(role!.color)
                        .setAuthor(
                          target!.displayName,
                          target!.user.displayAvatarURL({
                            dynamic: true,
                            size: 2048,
                          })
                        )
                        .setDescription(
                          `**Приветствуем** в "${clan.name}", ${target}\n\nТеперь вам доступен локальный чат сообщества и возможность создавать премиум войсы в категории "Социум"`
                        );
                      clanChat!.send(embed4);
                      const embed5 = new Discord.MessageEmbed()
                        .setColor(role!.color)
                        .setAuthor(
                          target!.displayName,
                          target!.user.displayAvatarURL({
                            dynamic: true,
                            size: 2048,
                          })
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
                      return target!.send(embed5);
                    } else if (
                      (reaction.emoji.id || reaction.emoji.name) ==
                      "633712357129977876"
                    ) {
                      const target = member;
                      if (!target) return;

                      const data = {
                        userId: owner!.id,
                      };

                      const dataClan = {
                        owner: owner!.id,
                      };

                      let user = await Users.findOne(data);
                      const dataUnix = {
                        userId: target.id,
                        ClubId: user!.ClubId,
                      };
                      console.log(user)
                      if (user!.isClubOwner && user!.ClubId !== null) {
                        let req = await requests.findOne(dataUnix);
                        if (req!.ClubId == user!.ClubId) {
                          let clan = await clans.findOne(dataClan);
                          if (!clan) return;

                          const embed3 = new Discord.MessageEmbed()
                            .setColor(target!.displayColor)
                            .setAuthor(
                              target!.displayName,
                              target!.user.displayAvatarURL({
                                dynamic: true,
                                size: 2048,
                              })
                            )
                            .setDescription(
                              `Вы отклонили заявку ${target} на вступление в сообщество`
                            );
                          owner!.send(embed3);

                          const role = guild!.roles.cache.get(clan.clanRole);
                          await requests.deleteOne((r: Document) => r.userId == target!.id && r.ClubId != null)

                          const embed4 = new Discord.MessageEmbed()
                            .setColor(role!.color)
                            .setAuthor(
                              target.displayName,
                              target.user.displayAvatarURL({
                                dynamic: true,
                                size: 2048,
                              })
                            )
                            .setDescription(
                              `Увы, но ваша заявка на вступление в \`"${clan.name}"\` была отклонена 😰 Попробуйте подать её снова позже, либо вступить в другое сообщество!`
                            )
                            .setThumbnail(
                              `https://images-ext-2.discordapp.net/external/16xuIJrsUFv_ymWgxFXXJqp5iONF772OJyJGpzfyDcE/https/media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`
                            );

                          return target.send(embed4);
                        } else return;
                      } else return;
                    }
                  });
                });
            } else {
              const time = convertUnixToTime(req.time)
              let through = ''
              if (time.hour >= 1 && time.hour <= 24) through += `${time.hour} ч.`
              else if (time.min > 0 && time.min <= 60) through += `${time.min} м.`
              else if (time.sec > 0 && time.sec <= 60) through += `${time.sec} с.`
              const embed3 = new Discord.MessageEmbed()
                .setColor(member!.displayColor)
                .setAuthor(member!.displayName, member!.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                .setDescription(`Вы уже отправляли заявку на вступление в одно из сообществ!\nОжидайте ответа😴 ${through}`)
                .setThumbnail("https://images-ext-1.discordapp.net/external/nm17v9zPv9as-tt81-V7TnwiLilxX3TdY1zm78p4HR0/https/images-ext-2.discordapp.net/external/HKWZDKWxBWYCADf6kgE3z2vz29jPpxgY6T98DdF8Xrk/https/media.discordapp.net/attachments/620328811610767370/632969186242723840/3db13cfa0fd7d6df.png")
              return channel.send(embed3)
            }
          } else {

            const unixestime = unixTime() + (86400)
            await requests.insertOne({
              userId: member!.id, time: unixestime, ClubId: clan.ClubId
            }).save().catch(e => console.log(e));

            const owner = guild!.members.cache.get(clan.owner)

            // Сообщение в чат

            const embed4 = new Discord.MessageEmbed()
              .setColor(role.color)
              .setAuthor(member!.displayName, member!.user.displayAvatarURL({ dynamic: true }))
              .setDescription(`Ваша заявка отправлена создателю сообщества на рассмотрение!\nОжидайте ответа😴`)
              .setThumbnail(`https://images-ext-1.discordapp.net/external/nm17v9zPv9as-tt81-V7TnwiLilxX3TdY1zm78p4HR0/https/images-ext-2.discordapp.net/external/HKWZDKWxBWYCADf6kgE3z2vz29jPpxgY6T98DdF8Xrk/https/media.discordapp.net/attachments/620328811610767370/632969186242723840/3db13cfa0fd7d6df.png`)
            channel.send(embed4)

            //#region Сообщение владельцу

            await owner!.send(new Discord.MessageEmbed()
              .setColor(role.color)
              .setTitle(` Так-так...`)
              .setDescription(`${member} хочет вступить в ваше сообщество! Используйте команду - \`"!сб принять @участник"\` или\n\`"!сб отклонить @участник"\` в зависимости от вашего решения.`)
              .setFooter(`Выбранную команду пропишите во 🤖┃флуд-боты`)
              .setThumbnail(`https://media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`)).then(async m => {

                await m.react(`633712359772389386`)
                await m.react(`633712357129977876`)

                const filter = (react: Discord.MessageReaction, user: Discord.GuildMember) => (react.emoji.id == '633712359772389386' || react.emoji.id == '633712357129977876') && user.id == owner!.id
                const collector = m.createReactionCollector(filter, { time: 3600000 })
                m.delete({ timeout: 3600000 }).then(async () => {
                  await requests.deleteOne((r: Document) => r.userId == member!.id && r.ClubId != null)
                })
                collector.on('collect', async reaction => {

                  if ((reaction.emoji.id || reaction.emoji.name) == '633712359772389386') {
                    const target = member;
                    const data = {
                      userId: owner!.id
                    }

                    const dataClan = {
                      owner: owner!.id
                    };

                    let user = await Users.findOne(data)
                    if (user!.isClubOwner && user!.ClubId !== null) {
                      let close = await clans.findOne({ owner: owner!.id })

                      let req = await requests.findOne({ userId: target!.id, ClubId: user!.ClubId })

                      if (req == null) {
                        const embed1 = new Discord.MessageEmbed()
                          .setColor(member!.displayColor)
                          .setAuthor(member!.displayName, member!.user.displayAvatarURL({ dynamic: true }))
                          .setDescription(`Пользователь ${target}, не отправлял заявку, либо время уже истекло!`)
                        return owner!.send(embed1)
                      } else {
                        const members = (await Users.fetch())
                          .filter((value: Document) => value.ClubId === close!.ClubId)
                          .array();;
                        if (members.length == close!.slots) {
                          const embed = new Discord.MessageEmbed()
                            .setColor(member!.displayColor)
                            .setAuthor(member!.displayName, member!.user.displayAvatarURL({ dynamic: true }))
                            .setTitle(`Ошибка!`)
                            .setDescription(`Данное сообщество переполнено`)
                          return owner!.send(embed)
                        }
                        let clan = await clans!.findOne(dataClan)

                        if (!clan) return
                        let clanChat = guild!.channels.cache.get(clan.clanChat) as Discord.TextChannel
                        const embed3 = new Discord.MessageEmbed()
                          .setColor(owner!.displayColor)
                          .setAuthor(owner!.displayName, owner!.user.displayAvatarURL({ dynamic: true }))
                          .setDescription(`${owner}, вы приняли ${target} в сообщество!`)
                        owner!.send(embed3)

                        const role = guild!.roles.cache.get(clan.clanRole)

                        const dataAccept = {
                          userId: target!.id
                        }

                        await target!.roles.add(role!)
                        await requests.deleteOne((r: Document) => r.userId == target!.id && r.ClubId != null)
                        await Users.updateOne(dataAccept, { ClubId: clan.ClubId })
                        const embed4 = new Discord.MessageEmbed()
                          .setColor(role!.color)
                          .setAuthor(target!.displayName, target!.user.displayAvatarURL({ dynamic: true }))
                          .setDescription(`**Приветствуем** в "${clan.name}", ${target}\n\nТеперь вам доступен локальный чат сообщества и возможность создавать премиум войсы в категории "Социум"`)
                        clanChat!.send(embed4)
                        const embed5 = new Discord.MessageEmbed()
                          .setColor(role!.color)
                          .setAuthor(target!.displayName, target!.user.displayAvatarURL({ dynamic: true }))
                          .setDescription(`**Поздравляем**, вас приняли в сообщество \`"${clan.name}"\`\n\nС этого момента вам доступна функция приватных голосовых каналов и чатов в категории "Социум"\nВидеть и писать в приватный чат могут только участники данного сообщества, причём постоянно!😌`)
                          .setFooter(`Используйте команду - "!сб пополнить [сумма]", чтобы сделать свой взнос в общий капитал!`)
                          .setThumbnail(`https://images-ext-2.discordapp.net/external/16xuIJrsUFv_ymWgxFXXJqp5iONF772OJyJGpzfyDcE/https/media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`)
                        return target!.send(embed5)

                      }

                    }
                  }
                  else if (
                    (reaction.emoji.id || reaction.emoji.name) ==
                    "633712357129977876"
                  ) {
                    const target = member;
                    if (!target) return;

                    const data = {
                      userId: owner!.id,
                    };

                    const dataClan = {
                      owner: owner!.id,
                    };

                    let user = await Users.findOne(data);
                    const dataUnix = {
                      userId: target.id,
                      ClubId: user!.ClubId,
                    };
                    if (user!.isClubOwner && user!.ClubId !== null) {
                      let req = await requests.findOne(dataUnix);
                      if (req!.ClubId == user!.ClubId) {
                        let clan = await clans.findOne(dataClan);
                        if (!clan) return;

                        const embed3 = new Discord.MessageEmbed()
                          .setColor(target!.displayColor)
                          .setAuthor(
                            target!.displayName,
                            target!.user.displayAvatarURL({
                              dynamic: true,
                              size: 2048,
                            })
                          )
                          .setDescription(
                            `Вы отклонили заявку ${target} на вступление в сообщество`
                          );
                        owner!.send(embed3);

                        const role = guild!.roles.cache.get(clan.clanRole);
                        await requests.deleteOne((r: Document) => r.userId == target!.id && r.ClubId != null)

                        const embed4 = new Discord.MessageEmbed()
                          .setColor(role!.color)
                          .setAuthor(
                            target.displayName,
                            target.user.displayAvatarURL({
                              dynamic: true,
                              size: 2048,
                            })
                          )
                          .setDescription(
                            `Увы, но ваша заявка на вступление в \`"${clan.name}"\` была отклонена 😰 Попробуйте подать её снова позже, либо вступить в другое сообщество!`
                          )
                          .setThumbnail(
                            `https://images-ext-2.discordapp.net/external/16xuIJrsUFv_ymWgxFXXJqp5iONF772OJyJGpzfyDcE/https/media.discordapp.net/attachments/620328811610767370/632973833187491901/176e3071c4d2d355.png`
                          );

                        return target.send(embed4);
                      } else return;
                    } else return;
                  } else return;
                })
              })
          }
        }
      }
    }
  }
}

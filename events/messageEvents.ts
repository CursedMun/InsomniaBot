import { Event, Discord, Core, Document } from "discore.js";
import Constants, { TransactionsTypes } from "../util/Constants";
import * as helper from "../util/helpers";
import * as functions from "../util/functions";
import { updateMessage } from "../Methods/updateMessage";
import { customreactions } from "../Methods/customReactions";
import { withdrawTransaction, awardPack, awardTransaction } from "../Methods/allRelatedToCurrency";
import { wholeNumber } from "../util/functions";
const Used = new Set()
class MessageReactionAdd extends Event {
  get options() {
    return { name: "messageReactionAdd" };
  }

  async run(reaction: Discord.MessageReaction, member: Discord.ClientUser) {
    if (member.bot) return;
    const discordemojis = await this.client.db
      .getCollection("discordemojis")
      ?.findOne((de: Document) => de.channelid == reaction.message.channel.id && de.emojiid == (reaction.emoji.id || reaction.emoji.name ));
    console.log(discordemojis)
    const message = reaction.message;
    if (reaction.message.channel.id == Constants.Ids.Chs.ServerChats.CreationChat) {
      if (discordemojis && !discordemojis.price) {
        const PostVerify = await this.client.db.getCollection("creatorspost")?.getOne({ messageID: message.id})!
        if (message.reactions.cache.find(x => x.emoji.id == reaction.emoji.id)!.count! >= 15 && !PostVerify.used) {
          PostVerify.content = message.content ? message.content : message.attachments.first() ? message.attachments.first()?.url : "";
          PostVerify.used = true;
          PostVerify.userId = message.member?.id;
          PostVerify.date = new Date();
          await PostVerify.save();
          const ch = message.guild?.channels.cache.get(Constants.Ids.Chs.ServerChats.AdminChat) as Discord.TextChannel
          ch.send(new Discord.MessageEmbed({
            title: "Проверка творчества 🖼️",
            description: `Нужно ли постить это в <#656586135690149893> ? \n\nВ канале <#605185840750002177> [>пост<](https://discordapp.com/channels/${message.guild!.id}/${message.channel.id}/${message.id}) набрал **15** 💎${message.content ? `\n"\n${message.content}"` : ""}`,
            color: 15406156,
            footer: {
              text: "🗳️ 50% голосов администраторов и пост отправляется в <#656586135690149893> "
            },
            image: { url: message.attachments.first() ? message.attachments.first()!.url : "" },
            fields: [
              {
                name: "Отправить в объявления",
                value: "<a:done:633677830907101216>",
                inline: true
              },
              {
                name: "Не отправлять в объявления",
                value: "<a:no_Insomnia:634885617313906738>",
                inline: true
              }
            ]
          }
          )).then(async (m) => {
            await m.react(`633677830907101216`);
            await m.react(`634885617313906738`);
            const filter = (
              react: Discord.MessageReaction,
              member: Discord.ClientUser
            ) =>
              (react.emoji.id == "633677830907101216" ||
                react.emoji.id == "634885617313906738") &&
              !member.bot &&
              message.guild?.members.cache.get(member.id)!.roles.cache.has(Constants.Ids.Roles.Staff.administrator)!

            const collector = m.createReactionCollector(filter, {
              time: 3600000 * 5,
              //time: 1000 * 30,
            });
            m.delete({ timeout: 3600000 * 5 }).catch(console.error);
            collector.on("end", async (reaction) => {
              const yes = reaction.filter(r => r.emoji.id == "633677830907101216")
              const affSize = yes.first()?.users.cache.filter(u => !u.bot && message.guild?.members.cache.get(u.id)?.roles.cache.has(Constants.Ids.Roles.Staff.administrator)!).size
              const administator = message.guild?.roles.cache.get(Constants.Ids.Roles.Staff.administrator)?.members!;
              const no = reaction.filter(r => r.emoji.id == "634885617313906738")
              const percentage = (affSize! / administator.size) * 100
              if (percentage >= 50) {
                const ch = m.guild?.channels.cache.get(Constants.Ids.Chs.ServerChats.NewsChat) as Discord.TextChannel
                if (message.content.length <= 0 && message.attachments.size > 0) {
                  const embed = new Discord.MessageEmbed({
                    title: "Творчество участника",
                    description: `[Работа](https://discordapp.com/channels/${message.guild!.id}/${message.channel.id}/${message.id}) ${message.member} была оценена по достоинству, и мы хотим показать её вам.\n\n:exclamation:Не забывайте заглядывать в #<#605185840750002177>\nВозможно, именно Ваша работа будет следующей. :frame_photo:`,
                    color: 53380,
                    footer: {
                      text: "Поддержите интересное творчество!"
                    },
                    image: { url: message.attachments.first()!.url }
                  })
                  await ch.send(embed)
                }
                else if (message.content.length > 0 && message.attachments.size > 0) {
                  const embed = new Discord.MessageEmbed({
                    title: "Творчество участника",
                    description: `[Работа](https://discordapp.com/channels/${message.guild!.id}/${message.channel.id}/${message.id}) ${message.member} была оценена по достоинству и мы хотим показать её вам.\n\n"${message.content}"`,
                    color: 53380,
                    footer: {
                      text: "🖼️ Не забывайте заглядывать в 💎┃творчество. Возможно, именно Ваша работа будет следующей. "
                    },
                    image: { url: message.attachments.first()!.url }
                  }
                  )
                  await ch.send(embed)
                }
                else if (message.content.length > 0 && message.attachments.size <= 0) {
                  const embed = new Discord.MessageEmbed({
                    title: "Творчество участника",
                    description: `[Работа](https://discordapp.com/channels/${message.guild!.id}/${message.channel.id}/${message.id}) ${message.member} была оценена по достоинству и мы хотим показать её вам.\n\n"${message.content}"`,
                    color: 53380,
                    footer: {
                      text: "🖼️ Не забывайте заглядывать в 💎┃творчество. Возможно, именно Ваша работа будет следующей. "
                    },
                    image: { url: "https://i.imgur.com/PMS9tP0.jpg" }
                  }

                  )
                  await ch.send(embed)
                }
                return m.channel.send("Успешно отправил в канал творчество")
              } else {
                return m.channel.send(`Чёт пошло не так набрал ${percentage}%`)
              }
            })
          }
          )
        }
      }
    } else
      if (reaction.emoji.name == "🍪") {
        if (member.id == message.member!.id) return;
        const targetx = message.member;
        if (!targetx) return;
        const Users = this.client.db.getCollection("users")!;
        const cookies = this.client.db.getCollection("cookiesystem")!;
        let target = await Users.findOne({ userId: targetx.id });
        let cookie = await cookies.getOne({
          userID: message.member!.id,
          targetID: targetx.id,
        });
        const time = helper.unixTime();
        if (!cookie.timeout) {
          const unixestime = time + 600;
          cookie!.timeout = unixestime
          target!.cookies = target!.cookies + 1
          await cookie!.save().catch(console.error)
          return await target!.save().catch(console.error)
        } else if (cookie && cookie.timeout <= time) {
          const unixestime = time + 600;
          cookie!.timeout = unixestime
          target!.cookies = target!.cookies + 1
          await cookie!.save().catch(console.error)
          return await target!.save().catch(console.error)

        } else return
      } else if (discordemojis && discordemojis.price && !Used.has(member.id) && member.id != message.author.id) {
        const amount = wholeNumber(Number(discordemojis.price));
        withdrawTransaction(member, amount, this.client, Constants.TransactionsTypes[10])
        awardTransaction(reaction.message.member!, amount, this.client, Constants.TransactionsTypes[10])
      }
  }
}
class Message extends Event {
  get options() {
    return { name: "message" };
  }

  async run(message: Discord.Message) {
    if (message.embeds.length > 0 && message.channel.id == Constants.Ids.Chs.ServerChats.FloodChat) {
      //BUMP
      if (message.embeds.map(m => m.description).filter(Boolean).filter(m => m!.includes("Server bumped by")).length > 0 && message.author.id == "315926021457051650") {

        const match = message.embeds.map(m => m.description).toString().match(/(?:<@!?)?([0-9]+)>?/)!
        const member = message.guild?.members.cache.get(match[1])
        if (member) {
          message.channel.send(member.user.username, new Discord.MessageEmbed({
            description: "```fix\nСпасибо за bump, в благодарность держи 50 звезд\n\nКоманда снова будет доступна через 4 часа```",
            color: 53380,
            footer: {
              text: "Инсомния благодарит тебя за помощь серверу!"
            },
            thumbnail: { url: "https://i.imgur.com/XrMTjCB.png" }
          }))
          awardTransaction(member, 50, this.client, TransactionsTypes[14])
          setTimeout(() => {
            return message.channel.send("<@&508706031338127360> <@&509465866270933008>  <@&530475930695499796>", new Discord.MessageEmbed({
              description: "```fix\nДоступен АП сервера\nПропишите !bump\n```",
              color: 53380,
              footer: {
                text: "Награда - 50 звезд",
                icon_url: "https://i.imgur.com/XwkzxDZ.gif"
              },
              thumbnail: { url: "https://i.imgur.com/ducrUph.png" }
            }))
          }, 1.44e+7)
        }
      }
      //S.UP
      if (message.embeds.map(m => m.description).filter(Boolean).filter(m => m!.includes("Оцени его на")).length > 0 && message.author.id == "464272403766444044") {
        const member = message.guild?.members.cache.find(u => u.user.tag == message.embeds[0].footer?.text)
        if (member) {
          message.channel.send(member.user, new Discord.MessageEmbed({
            description: "```fix\nСпасибо за UP, в благодарность держи 50 звезд\n\nКоманда снова будет доступна через 4 часа```",
            color: 53380,
            footer: {
              text: "Инсомния благодарит тебя за помощь серверу!"
            },
            thumbnail: { url: "https://i.imgur.com/szk1bs3.png" }
          }));
          awardTransaction(member, 50, this.client, TransactionsTypes[15])
          setTimeout(() => {
            return message.channel.send("<@&508706031338127360> <@&509465866270933008>  <@&530475930695499796>", new Discord.MessageEmbed({
              description: "```fix\nДоступен UP сервера\nПропишите s.up\n```",
              color: 53380,
              footer: {
                text: "Награда - 50 звезд",
                icon_url: "https://i.imgur.com/XwkzxDZ.gif"
              },
              thumbnail: { url: "https://i.imgur.com/49opLNN.png" }
            }))
          }, 1.44e+7)
        }
      }
    }
    if (message.author.bot) return
    if (message.channel.type == "dm") {
      if (message.author.bot) return;
      try {
        await this.client.users.fetch(Constants.Ids.dev.Dev).then((resolve) => {
          if (message.author.id === resolve.id) return;

          const notifyDM = new Discord.MessageEmbed()
            .setTitle(
              `Сообщение от ${message.author.tag} | ID (${message.author.id})`
            )
            .setColor(helper.randomHexColor());
          if (message.attachments.first()) {
            notifyDM.addField("**Сообщение**\n", message.content);
            notifyDM.setDescription(
              `**Вложение:**\n${message.attachments.array()[0].url}`
            );
          } else notifyDM.setDescription(message.content);

          resolve.send(notifyDM);
        });
      } catch (error) {
        console.log(error);
      }
    }
    if (message.content.includes("🍪")) {
      const targetx = message.mentions.members?.first();
      if (!targetx) return;
      if (targetx == message.member) return;
      const Users = this.client.db.getCollection("users")!;
      const cookies = this.client.db.getCollection("cookiesystem")!;
      let target = await Users.findOne({ userId: targetx.id });
      let cookie = await cookies.getOne({
        userID: message.member!.id,
        targetID: targetx.id,
      });
      const time = helper.unixTime();
      if (!cookie.timeout) {
        const unixestime = time + 600;
        cookie!.timeout = unixestime
        target!.cookies = target!.cookies + 1
        await cookie!.save().catch(console.error)
        return await target!.save().catch(console.error)
      } else if (cookie && cookie.timeout <= time) {
        const unixestime = time + 600;
        cookie!.timeout = unixestime
        target!.cookies = target!.cookies + 1
        await cookie!.save().catch(console.error)
        return await target!.save().catch(console.error)

      } else return
    }
    if (
      Math.random() < 0.0033 &&
      message.channel.id == Constants.Ids.Chs.ServerChats.MainChat
    ) {
      let amount = functions.randomInt(10, 70);
      let drop = await this.client.db
        .getCollection("drops")
        ?.getOne({ channelID: message.channel.id });
      (drop!.value = amount), await drop!.save().catch((e) => console.log(e));

      const notify = new Discord.MessageEmbed()
        .setColor(helper.randomHexColor())
        .setDescription(`В чат упало **${amount}** звёзд!`)
        .setFooter(
          `Используйте команду - \"${this.client.prefix}пик\", чтобы забрать звёзды себе!`
        );
      return message.channel.send(notify);
    }

    updateMessage(message, this.client);
    const msgArr = message.content.split(" ");
    const cmd = msgArr[0]
      .slice(this.client.prefix.toString().length)
      .toLowerCase();
    const args = functions.removeExtraSpaces(msgArr.slice(1));
    customreactions(this.client, message, args, cmd);
  }
}
class MessageEmoji extends Event {
  get options() {
    return { name: "message" };
  }
  async run(message: Discord.Message) {
    if (message.author.bot || message.content.startsWith("!")) return;

    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    if (message.content.match(regex) || message.attachments.first() || message.content) {
      try {
        let discordemojis = await this.client.db.getCollection("discordemojis")?.filter((de: Document) => de.channelid == message.channel.id);
        if (discordemojis) {
          discordemojis.forEach(async (e: Document) => {
            if (e.channelid == message.channel.id) {
              await message.react(e.emojiid || e.value).catch(console.error);

            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    } else return;
  }
}
export =[Message, MessageReactionAdd, MessageEmoji];

import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { unixTime } from "../../util/helpers";
import {
  withdrawTransaction,
  awardTransaction,
} from "../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Основное",
      help: "Предложить @user стать парой",
      syntax: `${this.client.prefix}пара @user`,
      example: `${this.client.prefix}пара @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const LoveTaxs = this.client.db.getCollection("LoveTaxs");
    const beloved =
      message.mentions.members!.first() ||
      message.guild?.members.cache.get(args[0])!;
    if (!beloved) return;
    let user = await Users.findOne({
      userId: message.member!.id,
    })!;
    const config = await Configs.getOne({
      guildId: message.guild?.id,
    });
    const unixestime = unixTime() + 1987200 * 1;
    if (user!.relationship !== null)
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setDescription(`${message.author}, у вас уже есть пара.`)
      );

    const girl = Constants.Ids.Roles.MiscRoles.Female;
    const boy = Constants.Ids.Roles.MiscRoles.Male;
    if (!(
      [girl, boy].some(
        (r) => message.member!.roles.cache.has(r)
      ) && [girl, boy].some(
        (r) => beloved.roles.cache.has(r)
      ))
    ) {
      return message.channel
        .send(
          new Discord.MessageEmbed()
            .setColor(0x2f3136)
            .setDescription(
              `${message.author}, у вас, либо у вашей пары нет гендерной роли.`
            )
        )
        .then((m) => m.delete({ timeout: 50000 }));
    }

    if (
      message.member!.roles.cache.find((r) => r.id === boy) &&
      beloved.roles.cache.find((r) => r.id === boy)
    )
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setDescription(
            `${message.author}, у вашей пары должна быть другая гендерная роль`
          )
      );

    if (
      message.member!.roles.cache.find((r) => r.id === girl) &&
      beloved.roles.cache.find((r) => r.id === girl)
    )
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setDescription(
            `${message.author}, у вашей пары должна быть другая гендерная роль`
          )
      );
    withdrawTransaction(message.member!, 400, this.client, Constants.TransactionsTypes[4]).then(
      async (result) => {

        if (typeof result === "boolean" && !result) {
          return message.channel.send(
            new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setDescription(
                `${message.author}, чтобы создать пару, вам нужно **400**${
                config!.CurrencyLogo
                }`
              )
          );
        }
        await message.react("633712359772389386")
        const usertofind = await Users.findOne({ userId: beloved.id });
        if (usertofind!.relationship !== null) {
          return message.channel.send(
            new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setDescription(`У ${beloved} уже есть пара.`)
          );
        }
        let newMsg = await beloved
          .send(
            new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setDescription(
                `<@${message.author.id}> предлагает стать парой.\n\n**Выбирайте😌**\n\n<:Yes:633712359772389386> - Стать парой\n\n<:No:633712357129977876> - Отказаться`
              )
              .setThumbnail("https://i.imgur.com/nZ926H7.png")
              .setFooter("Поторопись! У тебя есть всего 15 минут на ответ.")
          )

        await newMsg.react("633712359772389386");
        newMsg.react("633712357129977876");

        newMsg
          .awaitReactions(
            (r, u) =>
              u.id === beloved.id &&
              ["633712359772389386", "633712357129977876"].includes(
                r.emoji.id || r.emoji.name
              ),
            {
              max: 1,
              time: 15 * 1000 * 60,
              errors: ["time"],
            }
          )
          .then(async (collected) => {
            const reaction = collected.first()!;

            if (
              (reaction.emoji.id || reaction.emoji.name) ===
              "633712359772389386"
            ) {
              const loveRole = message.guild?.roles.cache.get(Constants.Ids.Roles.Users.LoveRole)
              !message.member?.roles.add(loveRole!).then(async (r) => {
                user = await Users.findOne({
                  userId: message.member!.id,
                })!;
                user!.relationship = beloved.id;
                user!.relationshipRoleID = r.id;
                await user?.save().catch(console.error);
                beloved?.roles.add(loveRole!).then(async (role) => {
                  await Users.updateOne(
                    { userId: beloved.id },
                    {
                      relationship: message.author.id,
                      relationshipRoleID: role.id
                    }
                  );

                  await LoveTaxs?.insertOne({
                    idone: beloved.id,
                    idscnd: message.author.id,
                    time: unixestime,
                    stage: 0,
                  })
                    .save()
                    .catch((e) => console.log(e));

                  await beloved.send(
                    new Discord.MessageEmbed()
                      .setColor("#ce2626")
                      .setDescription(
                        `**Поздравляем**, вы с ${message.author} теперь пара!\n\nС этого момента вам доступна функция приватных голосовых каналов.
                                            Достаточно просто создать голосовой канал и зайти туда со своей парой!`
                      )
                      .setThumbnail("https://i.imgur.com/nZ926H7.png")
                  ).catch(err => console.error(`Не смог отправить смс в лс ${beloved!.user.tag}`));
                  await message.author.send(
                    new Discord.MessageEmbed()
                      .setColor("#ce2626")
                      .setDescription(
                        `**Поздравляем**, вы с ${beloved} теперь пара!\n\nС этого момента вам доступна функция приватных голосовых каналов.
                                            Достаточно просто создать голосовой канал и зайти туда со своей парой!`
                      )
                      .setThumbnail("https://i.imgur.com/nZ926H7.png")
                  ).catch(err => console.error(`Не смог отправить смс в лс ${message.member!.user.tag}`));
                  const channel = message.guild!.channels.cache.get(
                    Constants.Ids.Chs.ServerChats.MainChat
                  ) as Discord.TextChannel;
                  return channel.send(
                    new Discord.MessageEmbed()
                      .setColor("#ce2626")
                      .setDescription(
                        `Мы тут заметили, что ${message.author} и ${beloved} теперь пара 😏\nПоздравим, **INsomnia**!💤`
                      )
                  );
                })
              })

            } else if (
              (reaction.emoji.id || reaction.emoji.name) ===
              "633712357129977876"
            ) {
              awardTransaction(message.member!, 400, this.client);
              beloved.send(
                new Discord.MessageEmbed()
                  .setColor("#ce2626")
                  .setDescription(`Принято 😌`)
              );
              message.member!.send(
                new Discord.MessageEmbed()
                  .setColor("#ce2626")
                  .setDescription(
                    `${beloved} отклонил ваше предложение стать парой😭 Видимо в другой раз...`
                  )
              );
            }
          })
          .catch((error) => {
            newMsg.delete();
            awardTransaction(message.member!, 400, this.client);
            console.log(error);
            beloved.send(
              new Discord.MessageEmbed()
                .setColor("#ce2626")
                .setDescription(`Вы не подтвердили своё действие😌`)
            );
          });
      }
    );
  }
}

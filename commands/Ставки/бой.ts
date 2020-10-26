import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber, sendError, randomInt } from "../../util/functions";
import {
  withdrawTransaction,
  awardTransaction,
} from "../../Methods/allRelatedToCurrency";
function sleep(milliseconds: number) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}
export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Ставки",
      help: "Вызвать на поединок",
      syntax: `${this.client.prefix}бой @user [сумма]`,
      example: `${this.client.prefix}бой @user 150 `,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);
    const Users = this.client.db.getCollection("users")!;
    const Config = this.client.db.getCollection("configs");
    const cfg = await Config?.getOne({ guildId: Constants.Ids.guilds[0] })!;

    if (!target || target.id === member!.id) return;
    const amount = wholeNumber(Number(args[1]));
    if (!Number.isInteger(amount) || amount < 10 || amount > 10000 || !amount) return;
    // let TargetPrfl = await Users.getOne({ userId: target.id });
    // let MemberPrfl = await Users.getOne({ userId: member!.id });
    withdrawTransaction(member!, amount, this.client, Constants.TransactionsTypes[7]).then((result) => {
      if (typeof result === "boolean" && !result) {
        return sendError(
          channel as Discord.TextChannel,
          `У ${target} недостаточно ${cfg.CurrencyLogo}`
        ).catch(console.error);
      } else {
        withdrawTransaction(target!, amount, this.client, Constants.TransactionsTypes[7]).then((bool) => {
          if (typeof bool === "boolean" && !bool) {
            awardTransaction(member!, amount, this.client);
            return sendError(
              channel as Discord.TextChannel,
              `У ${target} недостаточно ${cfg.CurrencyLogo}`
            ).catch(console.error);
          } else {
            const image = ["https://i.imgur.com/TyS9KDb.gif"];

            const embed = new Discord.MessageEmbed()
              .setColor(member!.displayColor)
              .setAuthor(
                member!.displayName,
                member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
              ).setDescription(`${target}, я вызываю тебя на поединок!\n 
                                **Ставка:** ${amount}${cfg.CurrencyLogo}
    
                                <:Yes:633712359772389386> - принять вызов\n
                                <:No:633712357129977876> - отказаться\n`);

            const exit = new Discord.MessageEmbed()
              .setColor(target.displayColor)
              .setDescription(
                `Увы...Но трус ${target} отказался от поединка🙄\nВидимо в другой раз.`
              );

            channel.send(embed).then(async (m) => {
              await m.react(`633712359772389386`);
              await m.react(`633712357129977876`);
              const filter = (
                react: Discord.MessageReaction,
                user: Discord.GuildMember
              ) =>
                (react.emoji.id === "633712359772389386" ||
                  react.emoji.id === "633712357129977876") &&
                user.id === target.id;
              const collector = m.createReactionCollector(filter, {
                time: 60000,
              });
              collector.on("collect", async (reaction) => {
                if (reaction.emoji.id === "633712359772389386") {
                  m.delete();
                  const start = new Discord.MessageEmbed()
                    .setTitle(`Да начнётся бой!`)
                    .setColor(member!.displayColor);
                  channel.send(start).then(async (message) => {
                    const roll = new Discord.MessageEmbed();

                    let userscore = 0;
                    let scnduserscore = 0;
                    const asyncIterable = {
                      [Symbol.asyncIterator]() {
                        return {
                          i: 0,
                          next(): any {
                            if (this.i < 3) {
                              sleep(15000)
                              return Promise.resolve({ value: this.i++, done: false });
                            }

                            return Promise.resolve({ done: true });
                          }
                        };
                      }
                    };
                    async function Roll() {
                      for await (let num of asyncIterable) {
                        let rndmfirstuser = randomInt(1, 30);
                        let rndmscnduser = randomInt(1, 30);
                        if (rndmfirstuser > rndmscnduser) ++userscore;
                        else if (rndmscnduser == rndmfirstuser) {
                          ++userscore && ++scnduserscore
                        }
                        else if (rndmfirstuser < rndmscnduser) {
                          ++scnduserscore;
                        }
                        roll.setDescription(`${member} выпало ${rndmfirstuser} ${rndmfirstuser > rndmscnduser ? "<a:done:633677830907101216>" : "<a:no_Insomnia:634885617313906738>"} \n ${target} выпало ${rndmscnduser} ${rndmfirstuser < rndmscnduser ? "<a:done:633677830907101216>" : "<a:no_Insomnia:634885617313906738>"} \n **${num == 0 ? "." : num == 1 ? ".." : "..."}** \n **Счет:** \n
                                                            ${member}: **${userscore}**
                                                            ${target}: **${scnduserscore}**`);
                        await message.channel.send(roll).catch(console.error);
                      }
                    }
                    await Roll().then(r => {
                      message.delete()
                      roll
                        .setColor(member!.displayColor)
                        .setTitle(`Поединок окончен.`)
                        .setDescription(
                          `Поединок окончен.\n **Счёт**: \`${userscore}:${scnduserscore}\`\n${userscore > scnduserscore ? `${member} получает **${amount * 2}**` : userscore == scnduserscore ? "ничья" : `${target} получает **${amount * 2}**`} `
                        )
                        .setFooter(
                          `Используйте команду - "!$", чтобы проверить свой баланс.`
                        );
                      if (userscore == scnduserscore) {
                        awardTransaction(member!, amount, this.client);
                        awardTransaction(target!, amount, this.client);
                      } else {
                        awardTransaction(
                          userscore > scnduserscore ? member! : target!,
                          amount * 2,
                          this.client
                        );
                      }

                      return message.channel.send(roll).catch(console.error);
                    })
                  });
                } else if (reaction.emoji.id === "633712357129977876") {
                  awardTransaction(member!, amount, this.client);
                  awardTransaction(target!, amount, this.client);
                  m.delete();
                  channel.send(exit);
                }
              });
              collector.on('end', reaction => {
                m.delete()
                awardTransaction(member!, amount, this.client);
                awardTransaction(target!, amount, this.client);
                const nope = new Discord.MessageEmbed()
                  .setColor(member!.displayColor)
                  .setDescription(
                    `${member}, ваш вызов на поединок был проигнорирован`
                  );
                channel.send(nope);
              })
            });
          }
        });
      }
    });
  }
}

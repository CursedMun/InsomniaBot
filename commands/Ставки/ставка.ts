import { Command, Discord } from "discore.js";
import Constants, { Bets } from "../../util/Constants";
import {
  withdrawTransaction,
  awardTransaction,
} from "../../Methods/allRelatedToCurrency";
import { randomInt, wholeNumber } from "../../util/functions";
const usersBets: [{ id: string, timesWon: number }] = [{
  id: "",
  timesWon: 0,
}]
export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Ставки",
      help: "Сделать ставку (в случае выигрыша получить плюс х1 серверной валюты, в случае проигрыша потерять х1.5 серверной валюты). У вас изначально должно быть больше валюты для ставки. Минимальная ставка - 10, максимальная - 10000.",
      syntax: `${this.client.prefix}ставка [сумма]`,
      example: `${this.client.prefix}ставка 150`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { channel, member } = message;
    const config = await this.client.db
      .getCollection("configs")!
      .getOne({ guildId: Constants.Ids.guilds[0] });
    const currency = config.CurrencyLogo;
    const betflip = Bets.BetFlip;
    let imageToSend = "";
    if (!member) return;
    const amount = wholeNumber(Number(args[0]));
    if (!Number.isInteger(amount) || amount < Constants.Bets.BetFlip.minBet || amount > Constants.Bets.BetFlip.maxBet || !amount) {
      channel
        .send(
          new Discord.MessageEmbed({
            title: "Полегче!",
            color: Constants.Colors.Transparent,
            description: `Минимальная ставка – ${Constants.Bets.BetFlip.minBet.toLocaleString(
              'ru-RU'
            )}\nМаксимальная ставка – ${Constants.Bets.BetFlip.maxBet.toLocaleString(
              'ru-RU'
            )}`,
          })
        )
        .then((m) => m.delete({ timeout: 1e5 }));
      return;
    }
    const rate = wholeNumber(amount * 1);
    withdrawTransaction(member!, rate, this.client, Constants.TransactionsTypes[9]).then(async (result) => {
      if (typeof result === "boolean" && !result) {
        return channel
          .send(
            new Discord.MessageEmbed()
              .setColor(Constants.Colors.Transparent)
              .setTitle(`Полегче!`)
              .setDescription(
                `Прежде чем делать такие большие ставки, **заработай на них**!`
              )
              .setFooter(`У вас не хватает валюты.`)
          )
          .then((m) => m.delete({ timeout: 1e5 }));
      } else {
        const newMsg = await channel.send(
          new Discord.MessageEmbed()
            .setColor("#ce2626")
            .setDescription(
              `${member}, выбирайте😌\n\n<:orel:640827413865037844> - Орел\n\n<:rew:640827413659385878> - Решка`
            )
            .setThumbnail("https://i.imgur.com/gMDWxta.png")
            .setFooter("Поторопись! У тебя есть всего 1 минута на ответ.")
        );

        await newMsg.react(Constants.Bets.Emojis.Head);
        await newMsg.react(Constants.Bets.Emojis.Tail);

        newMsg
          .awaitReactions(
            (r, u) =>
              u.id === member!.id &&
              [Constants.Bets.Emojis.Head, Constants.Bets.Emojis.Tail].includes(
                r.emoji.id || r.emoji.name
              ),
            {
              max: 1,
              time: 6e5,
              errors: ["time"],
            }
          )
          .then(async (collected) => {
            const reaction = collected.first();
            // if ([Constants.Bets.Emojis.Head, Constants.Bets.Emojis.Tail].some(id => reaction!.emoji.id === id)) {
            //   let guess = reaction?.emoji.id == Constants.Bets.Emojis.Head ? Bets.BetFlipGuess.H : Bets.BetFlipGuess.T
            //   const rnd = randomInt(0, 1000);
            //   usersBets.find(x => x.id == member.id)
            //   if ()
            // }
            if (
              (reaction!.emoji.id || reaction!.emoji.name) ===
              Constants.Bets.Emojis.Head
            ) {
              let guess = Bets.BetFlipGuess["H"];
              const rnd = randomInt(0, 1000);
              if (rnd > 500) {
                result =
                  guess === Bets.BetFlipGuess.Heads
                    ? Bets.BetFlipGuess.Tails
                    : Bets.BetFlipGuess.Heads;
                imageToSend =
                  guess === Bets.BetFlipGuess.Heads
                    ? betflip.images.tail
                    : betflip.images.head;
              } else {
                if (rnd <= 500) {
                  result = Bets.BetFlipGuess.Heads;
                  imageToSend = betflip.images.head;
                } else {
                  result = Bets.BetFlipGuess.Tails;
                  imageToSend = betflip.images.tail;
                }
              }
              const notify = new Discord.MessageEmbed();
              notify.setThumbnail(imageToSend);
              let amount: number = 0;

              if (guess === result) {
                amount = wholeNumber(
                  amount * betflip.multiplier + rate - amount
                );

                notify
                  .setColor(member!.displayColor)
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                  )
                  .setTitle(`И так...Орёл`)
                  .setDescription(
                    `Повезло!\n**${amount}**${currency} перечислены на ваш счёт.`
                  )
                  .setFooter(
                    `Используйте команду - "!$", чтобы проверить свой баланс.`
                  );
                awardTransaction(member!, wholeNumber(amount * 2), this.client);
              } else {
                notify
                  .setColor(member!.displayColor)
                  .setTitle(`Посмотрим...Решка`)
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                  )
                  .setDescription(`Сожалею, не повезло😔`)
                  .setFooter(
                    `Используйте команду - "!$", чтобы проверить свой баланс.`
                  );
              }
              return channel.send(notify)
            } else if (
              (reaction!.emoji.id || reaction!.emoji.name) ===
              Constants.Bets.Emojis.Tail
            ) {
              let guess = Bets.BetFlipGuess["T"];
              const rnd = randomInt(0, 1000);
              console.log(rnd)
              if (rnd > 500) {
                result =
                  guess === Bets.BetFlipGuess.Heads
                    ? Bets.BetFlipGuess.Tails
                    : Bets.BetFlipGuess.Heads;
                imageToSend =
                  guess === Bets.BetFlipGuess.Heads
                    ? betflip.images.tail
                    : betflip.images.head;
              } else {
                if (rnd <= 500) {
                  result = Bets.BetFlipGuess.Tails;
                  imageToSend = betflip.images.tail;

                } else {
                  result = Bets.BetFlipGuess.Heads;
                  imageToSend = betflip.images.head;
                }
              }
              const notify = new Discord.MessageEmbed();
              notify.setThumbnail(imageToSend);

              let event = "Получение";
              let reason = "Выигрыш в ставка (ставка)";
              let amount = 0;

              if (guess === result) {
                amount = wholeNumber(
                  amount * betflip.multiplier + rate - amount
                );

                notify
                  .setColor(member!.displayColor)
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                  )
                  .setTitle(`И так...Решка`)
                  .setDescription(
                    `Повезло!\n**${amount}**${currency} перечислены на ваш счёт.`
                  )
                  .setFooter(
                    `Используйте команду - "!$", чтобы проверить свой баланс.`
                  );
                awardTransaction(member!, wholeNumber(amount * 2), this.client);
              } else {
                notify
                  .setColor(member!.displayColor)
                  .setTitle(`Посмотрим...Орёл`)
                  .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                  )
                  .setDescription(`Сожалею, не повезло😔`)
                  .setFooter(
                    `Используйте команду - "!$", чтобы проверить свой баланс.`
                  );

                event = `Конфискация`;
                reason = `Проигрыш в ставка (ставка)`;
              }
              return channel.send(notify)
            } else {
              console.log("Yeah")
            }
          }).catch(collected => {
            awardTransaction(member!, rate, this.client, Constants.TransactionsTypes[9])
            newMsg.delete().catch(() => { });
          });

      }
    });
  }
}

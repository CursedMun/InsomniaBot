import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import {
  withdrawTransaction,
  awardTransaction,
} from "../../Methods/allRelatedToCurrency";
import { wholeNumber } from "../../util/functions";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Ставки",
      help: "Колесо фортуны. Сделать ставки и испытать свою удачу. Может прибавить или отнять валюту.",
      syntax: `${this.client.prefix}колесо [сумма]`,
      example: `${this.client.prefix}колесо 150`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel } = message;
    const config = await this.client.db
      .getCollection("configs")!
      .getOne({ guildId: Constants.Ids.guilds[0] });
    const currency = config.CurrencyLogo;
    const amount = wholeNumber(Number(args[0]));
    if (!Number.isInteger(amount) || amount < 10 || amount > 10000 || !amount) return;
    withdrawTransaction(member!, amount, this.client, Constants.TransactionsTypes[8]).then((result) => {
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
          .then((m) => m.delete({ timeout: 10000 }));
      } else {
        let rifl = "";

        let result = "";

        let Multx = [0.3, 0.5, 0.8, 1.0, 1.4, 1.6, 1.9, 2.2];

        let Rifle = ["⬇", "⬅", "↙", "↘", "⬆", "➡", "↖", "↗"];

        const chance = Math.floor(Math.random() * (100 - 1 + 1) + 1);

        if (chance < 10) {
          const rndRifle = Math.floor(Math.random() * 4);
          let Mult = Multx.slice(4, 8);
          Rifle = Rifle.slice(4, 8);
          rifl += `${Rifle[rndRifle]}`;
          var number = wholeNumber(amount * Mult[rndRifle]);

          result += `${wholeNumber(number)}`;
          awardTransaction(member!, wholeNumber(number), this.client);

          let embed = new Discord.MessageEmbed()
            .setColor(Constants.Colors.Transparent)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setTitle(`**Колесо Фортуны**`)
            .setDescription(`**Ставка** ${amount} ${currency} \n **Ваш выигрыш:** ${result} ${currency} 
    
    [**${Multx[6]}**]  [**${Multx[4]}**]  [**${Multx[7]}**]
    
    [**${Multx[1]}**]       ${rifl}         [**${Multx[5]}**]
    
    [**${Multx[2]}**]  [**${Multx[0]}**]  [**${Multx[3]}**]
    
    `);

          return channel.send(embed);
        }
        if (chance > 10) {
          const rndRifle = Math.floor(Math.random() * 4);
          let Mult = Multx.slice(0, 4);
          Rifle = Rifle.slice(0, 4);
          rifl += `${Rifle[rndRifle]}`;
          var number = wholeNumber(amount * Mult[rndRifle]);

          result += `${wholeNumber(number)}`;
          awardTransaction(member!, wholeNumber(number), this.client);

          let embed = new Discord.MessageEmbed()
            .setColor(Constants.Colors.Transparent)
            .setAuthor(
              member!.displayName,
              member!.user.displayAvatarURL({
                dynamic: true,
                size: 2048,
              })
            )
            .setTitle(`**Колесо Фортуны**`)
            .setDescription(`**Ставка** ${amount} ${currency} \n **Ваш выигрыш:** ${result} ${currency} 
    
    [**${Multx[6]}**]  [**${Multx[4]}**]  [**${Multx[7]}**]
    
    [**${Multx[1]}**]       ${rifl}         [**${Multx[5]}**]
    
    [**${Multx[2]}**]  [**${Multx[0]}**]  [**${Multx[3]}**]
    
    `);
          return channel.send(embed);
        }
      }
    });
  }
}

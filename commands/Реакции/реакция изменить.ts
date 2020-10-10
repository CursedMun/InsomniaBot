import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Изменить цену реакции",
      syntax: `${this.client.prefix}реакция изменить [название] [цена]`,
      example: `${this.client.prefix}реакция изменить поцеловать 10`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("customreactions")!;
    if (!args) return;
    const name = args[0].toLowerCase();
    if (!name) return;

    const price = wholeNumber(Number(args[1]));
    if (!Number.isInteger(price)) return;
    const reaction = await react.findOne({ name: name });

    if (!reaction)
      return channel.send(
        new Discord.MessageEmbed()
          .setTitle("Уведомление")
          .setDescription(`${member}, реакция с данным названием не найдена!`)
      );

    let data = {
      _id: reaction._id,
    };

    await react.updateOne(data, { price: price })!.catch(console.error);

    const notify = new Discord.MessageEmbed()
      .setTitle("**Цена реакции изменена!**")
      .setDescription(
        `**Название**: ${reaction.name}\n**Новая цена**: ${price}`
      )
      .setColor("#5c7d8b");

    return channel.send(notify).catch(console.error);

  }
}

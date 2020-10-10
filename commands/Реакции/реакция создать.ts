import { Command, Discord, Core, Document, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces, wholeNumber } from "../../util/functions";
import { capitalizeFirstLetter } from "../../util/helpers";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Создать реакцию",
      syntax: `${this.client.prefix}реакция создать [название] [цена] [ембед]`,
      example: `${this.client.prefix}реакция создать поцелуй 10 ембед`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("customreactions")!;
    const gif = this.client.db.getCollection("reactgifs")!;
    const msgArr = content.split(" ");
    const arg = removeExtraSpaces(msgArr.slice(4));
    const name = args[0];
    if (!name) return;

    const price = args[1];
    if (!price) return;

    const embed = arg.join(" ");
    console.log(embed)
    if (!embed) return;
    await react.insertOne({
      name: name,
      price: price,
      embed: embed,
    });

    await gif.insertOne({
      name: name,
    });

    const reply = new Discord.MessageEmbed()
      .setColor("#5c7d8b")
      .setTitle(`Опа, новая реакция!`)
      .setDescription(`**Название**: \`${name}\`\n**Цена**: \`${price}\``);

    return channel.send(reply).catch(console.error);

  }
}

import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Удалить реакцию",
      syntax: `${this.client.prefix}реакция удалить [название]`,
      example: `${this.client.prefix}реакция удалить поцеловать`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("customreactions")!;
    const gif = this.client.db.getCollection("reactgifs")!;
    if (!args[0]) return
    const name = args[0].toLowerCase();
    if (!name) return;
    const reaction = await react.findOne({ name: name })!;

    if (!reaction)
      return channel.send(
        new Discord.MessageEmbed()
          .setTitle("Уведомление")
          .setDescription(`${member}, на данный момент реакций нет!`)
      );

    let data = {
      name: reaction.name,
    };

    await react.deleteOne(data)!.catch(console.error);
    await gif.deleteOne(data)!.catch(console.error);
    const notify = new Discord.MessageEmbed()
      .setTitle("**Реакция удалена!**")
      .setDescription(
        `**Название**: ${reaction.name}\n**Цена**: ${reaction.price}`
      )
      .setColor("#5c7d8b");

    return channel.send(notify).catch(console.error);
  }
}

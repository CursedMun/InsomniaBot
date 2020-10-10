import { Command, Discord, Document, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces } from "../../util/functions";
export default class extends Command {
  get options() {
    return {
      name: "гиф удалить",
      permLevel: Constants.PermLevels.Moderator,
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Удалить ВСЕ гифки к выбранной реакции",
      syntax: `${this.client.prefix}гиф добавить [название реакции]`,
      example: `${this.client.prefix}гиф удалить поцеловать`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("reactgifs")!;

    const name = args[0].toLowerCase();
    if (!name) return;

    const data = {
      name: name,
    };
    const reactions = await react.findOne(data)
    if (!reactions) message.reply("Такой реакции нет").then(m => m.delete({ timeout: 5000 }))
    await react.updateOne(data, { gifUrl: null });

    const embed = new Discord.MessageEmbed()
      .setColor("#5c7d8b")
      .setDescription(`Все гифки реакции "${name}" удалены!`);

    return channel.send(embed);
  }
}

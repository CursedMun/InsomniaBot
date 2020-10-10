import { Command, Discord, Document, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces } from "../../util/functions";
export default class extends Command {
  get options() {
    return {
      name: "гиф добавить",
      permLevel: Constants.PermLevels.Moderator,
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Добавить гифку к реакции",
      syntax: `${this.client.prefix}гиф добавить [название реакции] [прямые ссылки через запятую]`,
      example: `${this.client.prefix}гиф добавить [название реакции] [прямые ссылки через запятую]`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("reactgifs")!;
    const msgArr = content.split(" ");
    const arg = removeExtraSpaces(msgArr.slice(3));
    const name = args[0];
    if (!name) return;

    const url = arg.join(",");
    if (!url) return;

    const data = {
      name: name,
    };
    let gif = await react.findOne(data);

    if (gif!.gifUrl === null || !gif!.gifUrl) {
      await react.updateOne(data, { gifUrl: url });
    } else {
      const update = gif!.gifUrl + ("," + url);
      await react.updateOne(data, { gifUrl: update });
    }

    const notify = new Discord.MessageEmbed()
      .setColor("#5c7d8b")
      .setDescription(`К реакции "${name}" добавлены гифки`);

    return channel.send(notify);
  }
}

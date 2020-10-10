import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Moderator,
      aliases: ["say"]
    };
  }
  get customOptions() {
    return {
      group: "Модерация",
      help: "Написать от лица бота (для объявлений)",
      syntax: `${this.client.prefix}ем [embed](https://embedbuilder.nadekobot.me/)`,
      example: `${this.client.prefix}ем [ембед]`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    message.delete()
    const text = args.join(' ');

    try {
      const json = JSON.parse(text);

      if ({}.hasOwnProperty.call(json, 'thumbnail')) {
        json.thumbnail = { url: json.thumbnail };
      }
      if ({}.hasOwnProperty.call(json, 'image')) {
        json.image = { url: json.image };
      }

      const plainText = json.plainText || '';
      delete json.plainText;

      const embed = new Discord.MessageEmbed(json);

      message.channel.send(plainText, embed);
      return message.author.send(`\`${text}\``)
    } catch (_) { }
  }
}

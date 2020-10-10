import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
      aliases: ["dm"]
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Отправить сообщение участнику через лс",
      syntax: `${this.client.prefix}лс @user сообщение`,
      example: `${this.client.prefix}лс @user Хай`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    let user =
      message.mentions.members!.first() ||
      message.guild!.members.cache.get(args[0]);
    const arg = args.slice(1)
    const text = arg.join(' ');

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
      if (json)
        user!.send(plainText, embed).catch(err => console.error(`Не смог отправить смс в лс ${user!.user.tag}`));
      else
        user?.send(text).catch(err => console.error(`Не смог отправить смс в лс ${user!.user.tag}`));
    } catch (_) { }
return await message.react("633712359772389386");
  }
}

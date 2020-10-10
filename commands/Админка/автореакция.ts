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
      group: "Админка",
      help: "Включить автореакции на канале. Бот будет ставить определенную реакцию на каждое сообщение. Добавлять по одной реакции. По необходимости включать цену (цена это количество валюты, которое юзер передаст автору сообщения, когда нажмет на реакцию)",
      syntax: `${this.client.prefix}автореакция channel emoji (price optional)`,
      example: `${this.client.prefix}автореакция 605185840750002177 :hello: 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    try {
      const { guild, mentions, member } = message;
      const emoji = this.client.db.getCollection("discordemojis");
      if (!args[0]) return message.reply("Укажите канал.");
      if (!args[1]) return message.reply("Укажите емодзи.");
      let channel = args[0];
      let emoji1: any = args[1];
      var numberPattern = /\d+/g;
      if (!channel.match(numberPattern)) return
      const regex = /[^\d]/g;
      const subst = ``;
      const result = emoji1.replace(regex, subst);

      await emoji
        ?.insertOne({
          channelid: channel,
          emojiid: result || emoji1,
          value: emoji1,
          price: args[2] ? args[2] : null,
        })
        .save()
        .catch((e) => console.log(e));
      return message
        .reply(`в ${channel} теперь будет эмоджи: ${emoji1.name || emoji1}`)
        .then((message) => message.delete({ timeout: 15000 }));
    } catch (error) {
      console.error("Ошибка в файле `channelcustomemoji.js` " + error);
      let embed = new Discord.MessageEmbed()
        .setTitle("Something went wrong!")
        .setColor("RED");
      return message
        .reply(embed)
        .then((message) => message.delete({ timeout: 15000 }));
    }
  }
}

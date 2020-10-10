import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Дополнительное",
      help: "Посмотреть свой аватар или участника",
      syntax: `${this.client.prefix}аватар @user`,
      example: `${this.client.prefix}аватар @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    let taggedUser = message.mentions.users.first() || message.author;
    message.channel.send(
      new Discord.MessageEmbed()
        .setAuthor(
          taggedUser.username,
          taggedUser.displayAvatarURL({ dynamic: true, size: 2048 })
        )
        .setColor("#808080")
        .setTitle("Аватар:")
        .setImage(taggedUser.displayAvatarURL({ dynamic: true, size: 2048 }))
    );
  }
}

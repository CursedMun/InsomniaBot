import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get customOptions() {
    return {
      group: "Основное",
      help: "Написать пару слов в свой профиль",
      syntax: `${this.client.prefix}статус [текст]`,
      example: `${this.client.prefix}статус я принадлежу миру снов`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { channel, member } = message;
    const Users = this.client.db.getCollection("users")!;
    const text = args.join(" ");
    let user = await Users.getOne({ userId: member!.id });

    const notify = new Discord.MessageEmbed();
    notify.setColor(member!.displayColor);

    if (text.length > 150) {
      notify
        .setDescription(`${member}, вы превысили допустимое кол-во символов!`)
        .setFooter(`Максимальная длина 150 символов`);

    } else if (text.length) {
      notify.setDescription(`${member}, ваш статус успешно изменён!`);
      user!.status = text;
    } else if (user.status) {
      notify.setDescription(`${member}, ваш статус успешно удален!`);
      user!.status = "";
    }
    await user.save().catch((e) => console.log(e));
    return channel.send(notify).catch(console.error);
  }
}

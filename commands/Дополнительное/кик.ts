import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Дополнительное",
      help: "Кикнуть @user из голосового канала",
      syntax: `${this.client.prefix}кик @участник`,
      example: `${this.client.prefix}кик @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const user =
      message.mentions.members!.first() ||
      message.guild?.members.cache.get(args[0])!;
    const my_channel = guild!.channels.cache.get(member!.voice.channel! ? member!.voice.channel!.id : "0");
    if (!my_channel)
      return message
        .reply("вы должны находится в голосовом канале")
        .then((msg) => msg.delete({ timeout: 15000 }));
    const permissions = my_channel.permissionsFor(message.author.id);
    if (!permissions!.has("PRIORITY_SPEAKER"))
      return message
        .reply("недостаточно прав")
        .then((msg) => msg.delete({ timeout: 15000 }));

    if (!user.voice.channel)
      return message
        .reply("данный пользователь не находится в голосовом канале.")
        .then((msg) => msg.delete({ timeout: 15000 }));
    if (message.author.id == user.id)
      return message
        .reply("вы не можете кикнуть себя")
        .then((msg) => msg.delete({ timeout: 15000 }));
    if (user.hasPermission("ADMINISTRATOR")) return message
      .reply("вы не можете кикнуть администратора")
      .then((msg) => msg.delete({ timeout: 15000 }));
    if (member!.voice.channel!.id !== user.voice.channel.id)
      return message
        .reply("пользователь находится в другом голосовом канале")
        .then((msg) => msg.delete({ timeout: 15000 }));
    await my_channel.createOverwrite(user!.id, {
      CONNECT: false,
    });
    await user!.voice.kick();
    return message.channel.send(`${user} кикнут пользователем ${message.author}. Видимо вы чем-то не угодили <a:S_onfused:638751301525831690>`)

  }
}

import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { randomHexColor } from "../../util/helpers";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.EventCreator,
    };
  }
  get customOptions() {
    return {
      group: "Модерация",
      help: "Выдать мужскую гендерную роль",
      syntax: `${this.client.prefix}день @user`,
      example: `${this.client.prefix}день @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;

    const girl = Constants.Ids.Roles.MiscRoles.Female;

    const boy = Constants.Ids.Roles.MiscRoles.Male;

    const target = mentions.members!.first() || guild!.members.cache.get(args[0]);
    const boyrole = target?.guild.roles.cache.get(boy)
    if (!target || target.id === member!.id) return;

    if (target.roles.cache.has(boy)) return;

    await target.roles.add(boy);

    if (target.roles.cache.has(girl)) await target.roles.remove(girl);

    channel.send(
      new Discord.MessageEmbed()
        .setDescription(`${member} выдал роль ${boyrole} пользователю ${target}`)
        .setColor(randomHexColor())
    );

    const LogChannel = guild!.channels.cache.get(
      Constants.Ids.Chs.ServerChats.GenderChat
    ) as Discord.TextChannel;
    // Логирование
    return LogChannel.send(
      new Discord.MessageEmbed()
        .setTitle(`Выдача роли мальчика`)
        .setDescription(
          `${member} выдал(а) роль ${boyrole} пользователю ${target}(${target.user.tag})`
        )
        .setColor(randomHexColor())
    );
  }
}

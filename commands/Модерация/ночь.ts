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
      help: "Выдать женскую гендерную роль",
      syntax: `${this.client.prefix}ночь @user`,
      example: `${this.client.prefix}ночь @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;

    const girl = Constants.Ids.Roles.MiscRoles.Female;

    const boy = Constants.Ids.Roles.MiscRoles.Male;

    const target = mentions.members!.first() || guild!.members.cache.get(args[0]);
    const girlrole = target?.guild.roles.cache.get(girl)
    if (!target || target.id === member!.id) return;

    if (target.roles.cache.has(girl)) return;

    await target.roles.add(girl);

    if (target.roles.cache.has(boy)) await target.roles.remove(boy);
    channel.send(
      new Discord.MessageEmbed()
        .setDescription(`${member} выдал роль ${girlrole} пользователю ${target}`)
        .setColor(randomHexColor())
    );

    const LogChannel = guild!.channels.cache.get(
      Constants.Ids.Chs.ServerChats.GenderChat
    ) as Discord.TextChannel;
    // Логирование
    return LogChannel.send(
      new Discord.MessageEmbed()
        .setTitle(`Выдача роли девочки`)
        .setDescription(
          `${member} выдал(а) роль ${girlrole} пользователю ${target}(${target.user.tag})`
        )
        .setColor(randomHexColor())
    );
  }
}

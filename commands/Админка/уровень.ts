import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Administrator,
    };
  }
  get customOptions() {
    return {
      group: "Админка",
      help: "Выдать @user уровень",
      syntax: `${this.client.prefix}уровень @user [цифра]`,
      example: `${this.client.prefix}уровень @user 10`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const Users = this.client.db.getCollection("users")!;
    const amount = wholeNumber(Number(args[1]));
    if (!Number.isInteger(amount) && amount <= 0) return;
    const target =
      mentions.members!.first() || guild!.members.cache.get(args[0]);
    if (!target) return;
    const data = {
      userId: target.id,
    };
    const user = await Users.getOne({ userId: target.id });
    user.lvl = amount;
    user.xp = 0;
    const notify = new Discord.MessageEmbed();

    notify
      .setColor(member!.displayColor)
      .setAuthor(
        member!.displayName,
        member!.user.displayAvatarURL({ dynamic: true })
      )
      .setDescription(
        `${member} установил **${amount}** уровень пользователю ${target}`
      );

    await user.save().catch(console.error);
    return channel.send(notify);
  }
}

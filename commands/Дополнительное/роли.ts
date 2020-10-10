import { Command, Discord, Document } from "discore.js";
import Constants from "../../util/Constants";
import { convertUnixToFULL } from "../../util/functions";

export default class extends Command {
  get customOptions() {
    return {
      group: "Дополнительное",
      help: "Посмотреть список ваших временных ролей",
      syntax: `${this.client.prefix}роли`,
      example: `${this.client.prefix}роли`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, author } = message;
    const Unixes = this.client.db.getCollection("unixes");
    const member = mentions.members!.first() || message.member!;
    try {
      const items = (await Unixes!.fetch())
        .filter((value: Document) => value.userId == member.id && value.ClubId == null)
        .array();
      let role = null;
      let desc = "";
      const embed = new Discord.MessageEmbed();

      items.filter(Boolean).forEach((i: Document) => {
        role = guild!.roles.cache.get(i.role);

        const time = convertUnixToFULL(i.time);

        let through = "";

        if (time.day) through += `${time.day}д`;
        else if (time.hour) through += `${time.hour}ч`;
        else if (time.min) through += `${time.min}м `;
        if (role)
          desc += `\n${role}\n Осталось: **\`${through}\`**\n`;
      });

      embed
        .setColor(member.displayColor)
        .setDescription(desc)
        .setTitle(
          `${desc
            ? `Список временных ролей ${member.user.username}:`
            : "Список временных ролей пуст."
          }`
        );

      return channel.send(embed);
    } catch (e) {
      console.error(e);
    }
  }
}

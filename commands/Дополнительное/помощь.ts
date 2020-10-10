import { Command, Discord, CommandMessage } from "discore.js";
import Constants from "../../util/Constants";
import { capitalizeFirstLetter } from "../../util/helpers";
import { removeExtraSpaces } from "../../util/functions";

const PermissionLevels = {
  2: "Демон снов",
  3: "Новолуние",
  4: "Нитро бустер",
  5: "Спонсор",
  6: "Ведущий",
  7: "Куратор",
  8: "Модератор",
  9: "Администратор",
  10: "Разработчик",
};
export default class extends Command {
  get customOptions() {
    return {
      group: "Дополнительное",
      help: "Помощь",
      syntax: `${this.client.prefix}помощь [команда]`,
      example: `${this.client.prefix}помощь бой`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    let embed = new Discord.MessageEmbed();
    let PermissionLevel = 0;
    for (let i = 0; i < 11; i++) {
      if ((await this.client.permLevels.test(i, message, this.client)) === true)
        PermissionLevel = i;
    }
    const msgArr = message.content.split(" ");
    const arg = removeExtraSpaces(msgArr.slice(1));

    const searchString = arg.join(" ");
    if (searchString) {
      const search = this.client.commands.find(
        (c) =>
          c.name.toLowerCase() == searchString.toLowerCase() &&
          c.permLevel <= PermissionLevel ||
          c.aliases.includes(searchString.toLowerCase()) &&
          c.permLevel <= PermissionLevel
      )
        ? 1
        : this.client.commands.filter(
          (c) =>
            c.categories[0].toLowerCase() == searchString.toLowerCase() &&
            c.permLevel <= PermissionLevel
        ).size > 0
          ? 2
          : 0;
      if (search == 1) {

        embed.setTitle(
          `Команда || ${capitalizeFirstLetter(searchString.toLowerCase())}`
        );
        const c = this.client.commands.find(
          (c) => c.name.toLowerCase() == searchString.toLowerCase() ||
            c.aliases.includes(searchString.toLowerCase())
        )!;
        if (c.permLevel != 2 && c.permLevel != 3 && c.permLevel != 4 && c.permLevel != 5 && c.permLevel != 6 && c.permLevel != 7 && c.permLevel != 8 && c.permLevel != 9 && c.permLevel != 10) return;
        embed.addField(
          c.name,
          `Помощь:\`${c.custom.help}\`\nСинтаксис:${c.custom.syntax}\nПример:\`${
          c.custom.example
          }\`\nПрава доступа от:\`${
          PermissionLevels[c.permLevel]
            ? PermissionLevels[c.permLevel]
            : "Участник"
          }\`\nДополнительное:${
          c.aliases.length > 0 ? `\`${c.aliases}\`` : "Пусто"
          } `,
          false
        );

        return message.channel.send(embed);
      } else if (search == 2) {
        embed.setTitle(
          `Категория || ${capitalizeFirstLetter(searchString.toLowerCase())}`
        );
        let c = this.client.commands
          .filter((c) => c.categories[0].toLowerCase() == searchString.toLowerCase())
          .forEach((c) =>
            embed.addField(
              c.name,
              `Синтаксис:${c.custom.syntax}\nПример:\`${c.custom.example}\``,
              false
            )
          );
        return message.channel.send(embed);
      } else if (search == 0 && message.author.id == Constants.Ids.dev.Dev) {
        const command = this.client.commands.filter((c) => c.name.includes(searchString.toLowerCase()) || c.aliases.includes(searchString.toLowerCase()))!
        if (!command) return;
        message.reply(`Возможно вы имели в виду что-то из этого:\`${command.reduce((acc, cv) => acc + "," + cv.name )}\``)
      }

    } else {
      if (PermissionLevel != 2 && PermissionLevel != 3 && PermissionLevel != 4 && PermissionLevel != 5 && PermissionLevel != 6 && PermissionLevel != 7 && PermissionLevel != 8 && PermissionLevel != 9 && PermissionLevel != 10) return;
      embed.setTitle(
        `Команды сервера || ${
        PermissionLevels[PermissionLevel]
          ? PermissionLevels[PermissionLevel]
          : "Участник"
        }`
      );
      let array = this.client.commands
        .filter((c) => c.permLevel <= PermissionLevel)
        .map((c) => c.categories[0]);
      let arr = [...new Set(array)];
      arr.forEach((categorie) =>
        embed.addField(
          categorie,
          `${this.client.commands
            .filter((c) => c.categories[0] == categorie && c.permLevel <= PermissionLevel) 
            .map((c) => `\`${c.name}\``)
            .join(",")}`
        )
      );
      return message.channel.send(embed);
    }
  }
}

import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";

export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.NitroBooster,
    };
  }
  get customOptions() {
    return {
      group: "Основное",
      help: "Выдать себе цвет/Снять",
      syntax: `${this.client.prefix}цвет [[цвет-код](https://html-color-codes.info/Cvetovye-kody-HTML/)] /${this.client.prefix}цвет cнять`,
      example: `${this.client.prefix}цвет / ${this.client.prefix}цвет cнять`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member } = message;
    const role = message.member!.roles.cache.find((r) => r.name == "INcolor");
    if (args[0].toLowerCase() === "снять") {
      if (!role) return message.reply("У вас нет цветной роли.");
      role.delete().catch(console.error);
      return message.react("633712359772389386").catch(console.error);
    } else if (!args[0]) return
    else {
      const color = args[0];
      const catrole = guild!.roles.cache.get(
        Constants.Ids.ConfigRoles.colorsposition
      );
      if (!args[0].match(/^#[0-9a-f]{6}(?:[0-9a-f]{6})?$/i))
        return await message.react("633712357129977876").catch(console.error);

      return role
        ? role.edit({ color: color }).then((r) => {
          channel.send(
            new Discord.MessageEmbed()
              .setColor(r.color)
              .setDescription(
                `${message.member} обновляет себе цвет ${r} <a:done:633677830907101216>`
              )
          );
        })
        : await guild!.roles
          .create({
            data: {
              name: "INcolor",
              color: `${color}`,
              mentionable: false,
              position: catrole?.position,
            },
          })
          .then((r) => {
            message.member?.roles.add(r);
            channel.send(
              new Discord.MessageEmbed()
                .setColor(r.color)
                .setDescription(
                  `${message.member} выдает себе цвет ${r} <a:done:633677830907101216>`
                )
                .setFooter(`Чтобы поднять его, обратитесь к администрации!`)
            );
          });
    }
  }
}

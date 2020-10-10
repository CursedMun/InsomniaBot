import { Command, Discord, Core, MongoCollection, Document } from "discore.js";
import Constants from "../../util/Constants";
import { repeat, pluralize } from "../../util/helpers";
const renderPage = (
  core: Core,
  guild: Discord.Guild,
  page: number,
  items: Document[],
  maxItemsInPage: number
) => {
  let item = null;
  let fieldRoles = "";
  let fieldPrice = "";
  let fieldDays = "";
  const renderedPage = new Discord.MessageEmbed();
  for (let index = 0; index < items.length && index < maxItemsInPage; index++) {
    item = items[index + maxItemsInPage * (page - 1)];
    if (item) {
      fieldRoles +=
        repeat(`<:Empty:631891370151378979>`, 1) +
        ` **${index + 1 + 5 * (page - 1)}**` +
        repeat(`<:Empty:631891370151378979>`, 2) +
        ` ${item.roleID}\n\n`;
      if (item.timeDays) {
        if (item.timeDays == 1) {
          fieldDays = `${item.timeDays} день`;
        } else if (item.timeDays >= 2 && item.timeDays <= 5) {
          fieldDays = `${item.timeDays} дня`;
        } else {
          fieldDays = `${item.timeDays} дней`;
        }
      } else {
        fieldDays = `Навсегда`;
      }
      fieldPrice +=
        `\n` +
        repeat(`<:Empty:631891370151378979>`, 1) +
        `\`${item.price}🌟\`` +
        repeat(`<:Empty:631891370151378979>`, 1) +
        ` \`${fieldDays}\`\n`;
    }
  }
  renderedPage
    .setColor("#ce2626")
    .setAuthor(
      `Магазин личных ролей`,
      `https://media.discordapp.net/attachments/536487964507766784/616982258674302996/INSOMNIA.gif?width=135&height=135`
    )
    .addField(
      repeat(`<:Empty:631891370151378979>`, 1) +
      "Номер" +
      repeat(`<:Empty:631891370151378979>`, 3) +
      "Роль",
      `${fieldRoles}`,
      true
    )
    .addField(
      repeat(`<:Empty:631891370151378979>`, 1) +
      "Цена " +
      repeat(`<:Empty:631891370151378979>`, 2) +
      " Время",
      fieldPrice,
      true
    )
    .setFooter(`Для покупки используйте команду - "!купить [номер]"`)
    .setImage(`https://i.imgur.com/CywaGrs.gif`);

  return renderedPage;
};

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Магазин",
      help: "Посмотреть магазин личных ролей",
      syntax: `${this.client.prefix}магазин2`,
      example: `${this.client.prefix}магазин2`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, mentions } = message;
    const Configs = this.client.db.getCollection("configs")!;
    const tempRoles = this.client.db.getCollection("temproles")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });

    const maxItemsInPage = config!.ItemsOnPage;
    let roles = await tempRoles.fetch();
    let arr = roles.sort((a, b) => a.price - b.price).array();
    if (!roles.size)
      return message.reply(
        new Discord.MessageEmbed()
          .setTitle("Ошибка")
          .setColor("RED")
          .setDescription(`${member}, на данный момент магазин пуст.`)
      );
    let totalPages = Math.ceil(roles.size / Math.abs(maxItemsInPage));

    const response = renderPage(this.client, guild!, 1, arr, maxItemsInPage);
    if (!response) return;

    return channel.send(response).then(async (m) => {
      m.delete({ timeout: 80000 });
    });
  }
}

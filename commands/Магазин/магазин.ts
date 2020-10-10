import { Command, Discord, Core, MongoCollection, Document } from "discore.js";
import Constants from "../../util/Constants";
import { repeat, unixTime } from "../../util/helpers";
import { wholeNumber } from "../../util/functions";
import { withdrawTransaction } from "../../Methods/allRelatedToCurrency";
import moment from "moment";
const emojiNextPage = "▶";
const emojiPrevPage = "◀";

let totalPages = 0;

const renderPage = (
  core: Core,
  guild: Discord.Guild,
  page: number,
  items: Document[],
  maxItemsInPage: number
) => {
  let item = null;
  let role = null;
  let fieldRoles = "";
  let fieldPrice = "";
  let fieldDays = "";
  const renderedPage = new Discord.MessageEmbed();

  for (let index = 0; index < items.length && index < maxItemsInPage; index++) {
    item = items[index + maxItemsInPage * (page - 1)];
    if (item) {
      role = guild.roles.cache.get(item.role);
      if (role) {
        fieldRoles +=
          repeat(`<:Empty:631891370151378979>`, 1) +
          ` **${index + 1 + 5 * (page - 1)}**` +
          repeat(`<:Empty:631891370151378979>`, 2) +
          ` ${role}\n\n`;

        // let time = item.days == 1 ? `${item.days} день` : item.days > 2 && item.days < 5  ? `${item.days} дня` : `${item.days} дней`
        if (item.days && item.days !== 0) {
          if (item.days == 1) {
            fieldDays = `${item.days} день`;
          } else if (item.days >= 2 && item.days <= 4) {
            fieldDays = `${item.days} дня`;
          } else {
            fieldDays = `${item.days} дней`;
          }
        } else {
          fieldDays = `Навсегда`;
        }

        if (item.price < 99) {
          item.price = `${item.price} `;
        }
        fieldPrice +=
          `\n` +
          repeat(`<:Empty:631891370151378979>`, 1) +
          `\`${item.price}🌟\`` +
          repeat(`<:Empty:631891370151378979>`, 1) +
          ` \`${fieldDays}\`\n`;
      }
    }
  }

  renderedPage
    .setColor("#ce2626")
    .setAuthor(
      `Магазин временных ролей | Страница [${page}/${totalPages}] `,
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
    .setFooter(`Для покупки используйте команду - "!магазин купить [номер]"`)
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
      help: "Посмотреть магазин временных ролей",
      syntax: `${this.client.prefix}магазин`,
      example: `${this.client.prefix}магазин`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, mentions } = message;
    const Unixes = this.client.db.getCollection("unixes")!;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const shops = this.client.db.getCollection("shops")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });

    const maxItemsInPage = config!.ItemsOnPage;
    const Icon = config!.CurrencyLogo;
    let fetch = await shops.fetch();
    let result = fetch.sort((b, a) => b.price - a.price).array();
    if (!result.length)
      return message.reply(
        new Discord.MessageEmbed()
          .setTitle("Ошибка")
          .setColor("RED")
          .setDescription(
            `${member}, на данный момент магазин пустует, приходи попозже!`
          )
      );
    totalPages = Math.ceil(result.length / Math.abs(maxItemsInPage));
    const response = renderPage(
      this.client,
      guild!,
      1,
      result,
      maxItemsInPage
    );
    if (!response) return;

    return channel.send(response).then(async (m) => {
      m.delete({ timeout: 60000 });

      if (totalPages > 1) {
        await m.react(emojiPrevPage).catch(console.error);
        await m.react(emojiNextPage).catch(console.error);

        const filter = (
          react: Discord.MessageReaction,
          user: Discord.GuildMember
        ) =>
          (react.emoji.name === emojiPrevPage ||
            react.emoji.name === emojiNextPage) &&
          user.id === member!.id;
        const collector = m.createReactionCollector(filter, { time: 60000 });

        let page = 1;

        collector.on("collect", (reaction) => {
          reaction.users.remove(member!).catch(console.error);

          switch (reaction.emoji.toString()) {
            case emojiPrevPage:
              const prevPage = page - 1;

              if (prevPage === 0) return;
              const prevPageEmbed = renderPage(
                this.client,
                guild!,
                prevPage,
                result,
                maxItemsInPage
              );

              m.edit(prevPageEmbed).then(() => page--);
              break;

            case emojiNextPage:
              const nextPage = page + 1;

              if (nextPage > totalPages) return;
              const newPageEmbed = renderPage(
                this.client,
                guild!,
                nextPage,
                result,
                maxItemsInPage
              );

              m.edit(newPageEmbed).then(() => page++);
              break;
          }
        });
      }
    });

  }
}

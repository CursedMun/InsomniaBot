import { Command, Discord, Core, Document, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces, wholeNumber } from "../../util/functions";
import { capitalizeFirstLetter } from "../../util/helpers";

const emojiNextPage = "▶";
const emojiPrevPage = "◀";

let totalPages = 0;

const renderPage = (
  core: Core,
  page: number,
  items: Document[],
  maxItemsInPage: number
) => {
  const renderedPage = new Discord.MessageEmbed();

  renderedPage.setColor("#ce2626").setTitle(`Список реакций:`);
  for (let index = 0; index < items.length && index < maxItemsInPage; index++) {
    let reaction = items[index + maxItemsInPage * (page - 1)];
    if (reaction) {
      renderedPage.addField(
        `**Реакция**: ${capitalizeFirstLetter(reaction.name)}`,
        `**Цена**: ${reaction.price}\n`
      );
    }
  }

  return renderedPage;
};
export default class extends Command {
  get options() {
    return {
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Список реакций",
      syntax: `${this.client.prefix}список реакций`,
      example: `${this.client.prefix}список реакций`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("customreactions")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    });

    let fetch = await react.fetch();
    let result = fetch.sort((a, b) => a.price - b.price).array();
    const maxItemsInPage = 5;
    if (!result.length)
      return channel.send(
        new Discord.MessageEmbed()
          .setTitle("Уведомление")
          .setDescription(`${member}, на данный момент реакций нет!`)
      );

    const Icon = config!.CurrencyLogo;
    totalPages = Math.ceil(result.length / Math.abs(maxItemsInPage));
    const response = renderPage(this.client, 1, result, maxItemsInPage);
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
        const collector = m.createReactionCollector(filter, {
          time: 60000,
        });

        let page = 1;

        collector.on("collect", (reaction) => {
          reaction.users.remove(member!).catch(console.error);

          switch (reaction.emoji.toString()) {
            case emojiPrevPage:
              const prevPage = page - 1;

              if (prevPage === 0) return;
              const prevPageEmbed = renderPage(
                this.client,
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

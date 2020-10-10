import { Command, Discord, Document, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces } from "../../util/functions";
const emojiNextPage = "▶";
const emojiPrevPage = "◀";

let totalPages = 0;

const renderPage = (
  page: number,
  items: Document[],
  maxItemsInPage: number,
  channel: Discord.TextChannel
) => {
  const renderedPage = new Discord.MessageEmbed();

  renderedPage.setColor("#5c7d8b").setTitle(`Список гифок реакций: [${page}/${totalPages}]`);
  for (let index = 0; index < items.length && index < maxItemsInPage; index++) {
    let reaction = items[index + maxItemsInPage * (page - 1)];
    if (reaction) {
      const image = reaction.gifUrl;
      if (image === null)
        return channel.send(
          new Discord.MessageEmbed()
            .setTitle("Уведомление")
            .setDescription(`Cначала добавьте гифки к реакции!`)
        );

      const result = image.replace(/,/g, `\n`);
      renderedPage.addField(
        `**Реакция:** ${reaction.name}\n`,
        `**Гифки**: \n ${result}`
      );
    }
  }

  return renderedPage;
};
export default class extends Command {
  get options() {
    return {
      name: "гиф список",
      permLevel: Constants.PermLevels.Moderator,
    };
  }
  get customOptions() {
    return {
      group: "Реакции",
      help: "Показать все ссылки ко всем реакциям",
      syntax: `${this.client.prefix}гиф список`,
      example: `${this.client.prefix}гиф список`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, content } = message;
    const react = this.client.db.getCollection("reactgifs")!
    let fetch = await react.fetch();
    let result = fetch.sort((a, b) => a.name - b.name).array();
    const maxItemsInPage = 3;
    if (!result.length)
      return channel.send(
        new Discord.MessageEmbed()
          .setTitle("Уведомление")
          .setDescription(`${member}, на данный момент реакций нет!`)
      );
    totalPages = Math.ceil(result.length / Math.abs(maxItemsInPage));
    const response = renderPage(
      1,
      result,
      maxItemsInPage,
      channel as Discord.TextChannel
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
                prevPage,
                result,
                maxItemsInPage,
                channel as Discord.TextChannel
              );

              m.edit(prevPageEmbed).then(() => page--);
              break;

            case emojiNextPage:
              const nextPage = page + 1;

              if (nextPage > totalPages) return;
              const newPageEmbed = renderPage(
                nextPage,
                result,
                maxItemsInPage,
                channel as Discord.TextChannel
              );

              m.edit(newPageEmbed).then(() => page++);
              break;
          }
        });
      }
    });
  }
}

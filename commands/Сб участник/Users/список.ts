import { Command, Discord, Document, MongoCollection } from "discore.js";

const emojiNextPage = "▶";
const emojiPrevPage = "◀";

const renderPage = (
  guild: Discord.Guild,
  page: number,
  items: Document[],
  maxItemsInPage: number
) => {
  const renderedPage = new Discord.MessageEmbed();

  renderedPage.setColor("#5c7d8b").setDescription("Список сообществ ⬇");
  for (let index = 0; index < items.length && index < maxItemsInPage; index++) {
    let clan = items[index + maxItemsInPage * (page - 1)];
    if (clan) {
      const clanrole = guild.roles.cache.get(clan.clanRole);
      const clanowner = guild.members.cache.get(clan.owner)!;
      renderedPage.addField(
        `**Владелец: ${clanowner.user.username}**`,
        `**Сообщество:** ${clanrole}`
      );
    } else {
      renderedPage.addField(`Пусто`, `Пусто`);
    }
  }

  return renderedPage;
};
export default class extends Command {
  get options() {
    return {
      name: "сообщество список",
      aliases: "сб список",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Посмотреть список существующих сообществ и их владельцев",
      syntax: `${this.client.prefix}сб список`,
      example: `${this.client.prefix}сб список`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const selected = args[0];
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const taxs = this.client.db.getCollection("clantaxs")!;
    const config = await Configs.getOne({ guildId: message.guild?.id });
    const list = await clans.fetch();
    let arrClans = list.sort((a, b) => a.createdAt - b.createdAt).array();
    const maxItemsInPage = 10;
    if (!arrClans.length)
      return channel.send(
        new Discord.MessageEmbed()
          .setTitle("Удевомление!")
          .setDescription(`${member}, на данный момент сообществ нет!`)
      );
    let totalPages = Math.ceil(arrClans.length / Math.abs(maxItemsInPage));
    const response = renderPage(guild!, 1, arrClans, maxItemsInPage);
    if (!response) return;

    return channel.send(response).then(async (m) => {
      m.delete({ timeout: 120000 });

      if (totalPages > 1) {
        await m.react(emojiPrevPage).catch(console.error);
        await m.react(emojiNextPage).catch(console.error);

        const filter = (
          react: Discord.MessageReaction,
          user: Discord.GuildMember
        ) =>
          (react.emoji.name == emojiPrevPage ||
            react.emoji.name == emojiNextPage) &&
          user.id == member!.id;
        const collector = m.createReactionCollector(filter, { time: 120000 });

        let page = 1;

        collector.on("collect", (reaction) => {
          reaction.users.remove(member!).catch(console.error);

          switch (reaction.emoji.toString()) {
            case emojiPrevPage:
              const prevPage = page - 1;

              if (prevPage == 0) return;
              const prevPageEmbed = renderPage(
                guild!,
                prevPage,
                arrClans!,
                maxItemsInPage
              );

              m.edit(prevPageEmbed).then(() => page--);
              break;

            case emojiNextPage:
              const nextPage = page + 1;

              if (nextPage > totalPages) return;
              const newPageEmbed = renderPage(
                guild!,
                nextPage,
                arrClans!,
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

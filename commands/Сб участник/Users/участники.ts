import { Command, Discord, MongoCollection, Document, Core } from "discore.js";
const emojiNextPage = "▶";
const emojiPrevPage = "◀";

const renderPage = async (
  guild: Discord.Guild,
  page: number,
  items: Document[],
  maxItemsInPage: number,
  core: Core
) => {
  const renderedPage = new Discord.MessageEmbed();
  const UserDeposit = core.db.getCollection("userclubdeposits")
  renderedPage.setColor("#5c7d8b").setDescription("Список участников сообщества ⬇");
  for (
    let index = 0;
    index < items.length && index < maxItemsInPage;
    index++
  ) {
    let user = items[index + maxItemsInPage * (page - 1)];
    if (user) {
      const userdeposits = await UserDeposit!.findOne((ud: Document) => ud.userId == user.userId && ud.ClubId === user.ClubId)
      const member = guild.members.cache.get(user.userId)!;
      renderedPage.addField(
        `**Участник: ${member.user.tag}**`,
        `**Вклад:** ${userdeposits ? userdeposits.totalDeposit : "0"}`
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
      name: "сообщество участники",
      aliases: "сб участники",
    };
  }
  get customOptions() {
    return {
      group: "clans",
      help: "Посмотреть участников клана",
      syntax: `${this.client.prefix}сообщество участники`,
      example: `${this.client.prefix}сообщество участники`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { member, channel, content, guild } = message;
    const Users = this.client.db.getCollection("users")!;
    const maxItemsInPage = 10;
    const user = await Users.findOne({ userId: member!.id });
    if (user!.ClubId) {
      const members = await Users.filter(
        (value: Document) => value.ClubId === user!.ClubId
      ) as Document[];
      let totalPages = Math.ceil(
        members.length / Math.abs(maxItemsInPage)
      );
      const response = await renderPage(guild!, 1, members!, maxItemsInPage, this.client);
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
          const collector = m.createReactionCollector(filter, {
            time: 120000,
          });

          let page = 1;

          collector.on("collect", async (reaction) => {
            reaction.users.remove(member!).catch(console.error);

            switch (reaction.emoji.toString()) {
              case emojiPrevPage:
                const prevPage = page - 1;

                if (prevPage == 0) return;
                const prevPageEmbed = await renderPage(
                  guild!,
                  prevPage,
                  members!,
                  maxItemsInPage,
                  this.client
                );

                m.edit(prevPageEmbed).then(() => page--);
                break;

              case emojiNextPage:
                const nextPage = page + 1;

                if (nextPage > totalPages) return;
                const newPageEmbed = await renderPage(
                  guild!,
                  nextPage,
                  members!,
                  maxItemsInPage,
                  this.client
                );

                m.edit(newPageEmbed).then(() => page++);
                break;
            }
          });
        }
      });
    } else return;
  }
}

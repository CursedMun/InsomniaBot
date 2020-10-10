import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import {
  getRequiredExpForLevel,
  levelUpdate,
  generateProgressBar,
  updateOnline,
} from "../../Methods/allRelatedtoEXP";
import { convertSecondsToTime } from "../../util/functions";
import { repeat } from "../../util/helpers";
const rndSentences = ['Команда - "!статус"✍'];
export default class extends Command {
  get options() {
    return {
      aliases: ["я"],
    };
  }
  get customOptions() {
    return {
      group: "Основное",
      help: "Посмотреть свой профиль | профиль @user",
      syntax: `${this.client.prefix}профиль/я | ${this.client.prefix}профиль @user`,
      example: `${this.client.prefix}профиль @user`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const clans = this.client.db.getCollection("clans")!;
    const target = (mentions.members!.first() ||
      guild!.members.cache.get(args[0]) ||
      message.member)!;

    const userId = target.id;
    //const userInVoice = this.client.public.usersInVoice.get(userId);
    // if (userInVoice) {
    //   const dateNow = Date.now();
    //   const online = (dateNow - userInVoice.time) / 1000;
    //   if (online > 0)
    //     updateOnline(member?.voice.channel!, online, target!, this.client).catch(console.error);

    //   userInVoice.time = dateNow;
    // }

    const userPrfl = await Users.getOne({ userId });
    if (userPrfl.PacksOnline < userPrfl.online) {
      var PACK_PER_SEC: any = 18000;
      var PacksTime: any = userPrfl.online - userPrfl.PacksOnline;
      var packpoints = Math.floor(PacksTime / PACK_PER_SEC);
      if (packpoints > 0) {
        userPrfl.PacksOnline = userPrfl.online;
        userPrfl.packs = userPrfl.packs + packpoints;
        const notify = new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setTitle(`Поздравляем,`)
          .setDescription(
            `вам выпал контейнер за **5 часов** голосового онлайна!\n\nЧтобы открыть контейнер, используйте команду - "!открыть" во <#605187837628776478>.`
          )
          .setThumbnail(`https://i.imgur.com/xiQO00c.png`);

        target.send(notify).catch(err => console.error(`Не смог отправить смс в лс ${target.user.tag}`));
      }
      updateOnline(null, 0, target!, this.client).catch(console.error)
    }
    // const needXp = getRequiredExpForLevel(userPrfl.lvl);
    // if (userPrfl.xp >= needXp) {
    //   await levelUpdate(target, userPrfl, this.client);
    // }
    const config = await Configs.getOne({ guildId: message.guild?.id });

    const emoji = "<:box:632957783318462484>";

    const level = Number(userPrfl.lvl);

    const totalXp = getRequiredExpForLevel(level);

    const progress = (userPrfl.xp / totalXp) * 100;

    var timepoint: number = userPrfl.online - userPrfl.PacksOnline;
    var NextPacks = 18000 - timepoint;
    var nonepack = 18000 - userPrfl.online;

    const time = convertSecondsToTime(userPrfl.online, true);
    const PackTime = convertSecondsToTime(NextPacks, true);
    const PackNone = convertSecondsToTime(nonepack, true);
    const userStatus =
      userPrfl.status || rndSentences[~~(Math.random() * rndSentences.length)];
    const relation = userPrfl.relationship
      ? guild!.members.cache.get(userPrfl.relationship)!.user.username
      : `-`;

    let club = "-";
    let u;
    if (userPrfl.ClubId != null) {
      u = await clans.findOne({ ClubId: userPrfl.ClubId });
      if (u!.name) {
        club = u!.name;
      }
    }

    const profile = new Discord.MessageEmbed({
      title: "Статус:",
      color: target.displayColor,
      image: { url: userPrfl.picture ? userPrfl.picture : `https://i.imgur.com/FuCDm96.gif` },
      description: `**\`\`\`ini\n[${userStatus}]\`\`\`**`,
      author: {
        name: `💤Профиль ${target.user.username}`,
        iconURL: target.user.displayAvatarURL({ dynamic: true }),
      },
      fields: [
        {
          name: "<:voice:632921100388401182> Войс-онлайн",
          value: `**\`\`\`${time.h}ч : ${time.m}м\`\`\`**`,
          inline: true,
        },
        {
          name: "<:sms2:632962121600335872> Сообщений",
          value: `**\`\`\`${userPrfl.msgCount}\`\`\`**`,
          inline: true,
        },
        {
          name: "<:box:632957783318462484> До контейнера",
          value:
            userPrfl.PacksOnline == 0
              ? `**\`\`\`${PackNone.h}ч : ${PackNone.m}м\`\`\`**`
              : `**\`\`\`${PackTime.h}ч : ${PackTime.m}м\`\`\`**`,
          inline: true,
        },
        {
          name: `${repeat(
            `<:Empty:631891370151378979>`,
            3
          )}<:love_insomnia:634781545336537088> Пара`,
          value: `**\`\`\`${relation}\`\`\`**`,
          inline: true,
        },
        {
          name: `${repeat(
            `<:Empty:631891370151378979>`,
            3
          )}<:Clans_insomnia:634785677598392340> Сообщество`,
          value: `**\`\`\`${club}\`\`\`**`,
          inline: true,
        },
        {
          name: `<:topMoney:632970895496839198> Уровень: ${userPrfl.lvl}`,
          value: `${generateProgressBar(progress)} **${
            Math.round(progress) >= 100 ? "99" : Math.round(progress)
            }%**`,
          inline: false,
        },
        {
          name: "<:invent:634788552391000095> Инвентарь:",
          value: `\n${config!.CurrencyLogo}** \`${
            userPrfl.Currency
            }\`** ${emoji}** \`${userPrfl.packs}\`** 🍪** \`${
            userPrfl.cookies
            }\`**`,
          inline: false,
        },
      ],
    });
    return channel.send(profile).catch((e) => channel.send('an error occurred')).catch(console.log);;
  }
}

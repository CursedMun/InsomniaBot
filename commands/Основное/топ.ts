import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { convertSecondsToTime } from "../../util/functions";

export default class extends Command {
  get customOptions() {
    return {
      group: "Основное",
      help: "Посмотреть свой рейтинг в топах",
      syntax: `${this.client.prefix}топ / смс / войс-онлайна / $ / контейнеров / уровней / печенек`,
      example: `${this.client.prefix}топ смс`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, member, mentions } = message;
    const Configs = this.client.db.getCollection("configs");
    const Users = this.client.db.getCollection("users");
    if (!["смс", "сообщений", "уровней", "войс-онлайна", "контейнеров", "$", "богачей","печенек"].includes(args[0]) && args[0]) return;
    const loadingEmbed = new Discord.MessageEmbed({
      color: member?.displayColor,
      description: "Загрузка Топа..",
    });
    const LoadMessage = await message.channel
      .send(loadingEmbed)
      .catch(() => { });
    if (!LoadMessage) return;
    const config = await Configs?.findOne({ guildId: message.guild!.id });
    const docs = await Users!.fetch();
    const target = (mentions.members!.first() ||
      guild!.members.cache.get(args[0]))!;
    if (!args[0]) {
      let doc = docs.sort((b, a) => a.lvl - b.lvl);
      const topLvl = doc.array().findIndex((t) => t.userId == member!.id);

      doc = doc.sort((b, a) => a.online - b.online);
      const topOnline = doc.array().findIndex((t) => t.userId == member!.id);

      doc = doc.sort((b, a) => a.msgCount - b.msgCount);
      const topMessage = doc.array().findIndex((t) => t.userId == member!.id);

      doc = doc.sort((b, a) => a.packs - b.packs);
      const topPack = doc.array().findIndex((t) => t.userId == member!.id);

      doc = doc.sort((b, a) => a.Currency - b.Currency);
      const topCurrency = doc.array().findIndex((t) => t.userId == member!.id);

      doc = doc.sort((b, a) => a.cookies - b.cookies);
      const topCookies = doc.array().findIndex((t) => t.userId == member!.id);

      LoadMessage.edit("", {
        embed: {
          color: member?.displayColor,
          thumbnail: { url: member!.user.displayAvatarURL({ dynamic: true }) },
          title: `Ваш рейтинг в топах ⬇`,
          fields: [
            {
              name: `<:top_IN:632964118361538560> Топ уровней`,
              value: `**${topLvl + 1}** место`,
            },
            {
              name: `<:voice:632921100388401182> Топ войс-онлайна`,
              value: `**${topOnline + 1}** место`,
            },
            {
              name: `<:sms2:632962121600335872> Топ сообщений`,
              value: `**${topMessage + 1}** место`,
            },
            {
              name: `<:topMoney:632970895496839198> Топ богачей`,
              value: `**${topCurrency + 1}** место`,
            },
            {
              name: `<:box:632957783318462484> Топ контейнеров`,
              value: `**${topPack + 1}** место`,
            },
            {
              name: `🍪 Топ печенек`,
              value: `**${topCookies + 1}** место`,
            },
          ],
        },
      });
    } else if (target) {
      let doc = docs.sort((b, a) => a.lvl - b.lvl);
      const topLvl = doc.array().findIndex((t) => t.userId == target.id);

      doc = doc.sort((b, a) => a.online - b.online);
      const topOnline = doc.array().findIndex((t) => t.userId == target.id);

      doc = doc.sort((b, a) => a.msgCount - b.msgCount);
      const topMessage = doc.array().findIndex((t) => t.userId == target.id);

      doc = doc.sort((b, a) => a.packs - b.packs);
      const topPack = doc.array().findIndex((t) => t.userId == target.id);

      doc = doc.sort((b, a) => a.Currency - b.Currency);
      const topCurrency = doc.array().findIndex((t) => t.userId == target.id);

      doc = doc.sort((b, a) => a.cookies - b.cookies);
      const topCookies = doc.array().findIndex((t) => t.userId == target.id);

      LoadMessage.edit("", {
        embed: {
          color: member?.displayColor,
          thumbnail: { url: target!.user.displayAvatarURL({ dynamic: true }) },
          title: `Ваш рейтинг в топах ⬇`,
          fields: [
            {
              name: `<:top_IN:632964118361538560> Топ уровней`,
              value: `**${topLvl + 1}** место`,
            },
            {
              name: `<:voice:632921100388401182> Топ войс-онлайна`,
              value: `**${topOnline + 1}** место`,
            },
            {
              name: `<:sms2:632962121600335872> Топ сообщений`,
              value: `**${topMessage + 1}** место`,
            },
            {
              name: `<:topMoney:632970895496839198> Топ богачей`,
              value: `**${topCurrency + 1}** место`,
            },
            {
              name: `<:box:632957783318462484> Топ контейнеров`,
              value: `**${topPack + 1}** место`,
            },
            {
              name: `🍪 Топ печенек`,
              value: `**${topCookies + 1}** место`,
            },
          ],
        },
      });
    } else if (args[0].toLowerCase() === "уровней") {
      let u = docs
        .sort((b, a) => a.lvl - b.lvl)
        .array()
        .slice(0, 10);
      if (!u.length) return;

      const top = new Discord.MessageEmbed();
      top
        .setTitle("**Топ по уровням**")
        .setDescription("Самые общительные участники сервера ⬇")
        .setThumbnail(
          "https://media.discordapp.net/attachments/620328811610767370/633696969625305138/6329641183615385601.png?size=1024"
        )
        .setColor(member!.displayColor);

      const fmtUsers: { tag: any; lvlc: string }[] = [];

      u.forEach((user) => {
        const member = guild!.members.cache.get(user.userId);
        const tag = member ? member.user.tag : user.id;
        const lvlc = `${user.lvl}`;

        fmtUsers.push({ tag, lvlc });
      });

      fmtUsers.forEach((user, place) =>
        top.addField(
          `**#${place + 1} - ${user.tag}**`,
          `**Уровень:** ${user.lvlc}`
        )
      );

      return LoadMessage.edit(top).catch(console.error);
    } else if (["смс", "сообщений"].includes(args[0].toLowerCase())) {
      let u = docs
        .sort((b, a) => a.msgCount - b.msgCount)
        .array()
        .slice(0, 10);
      if (!u.length) return;

      const top = new Discord.MessageEmbed();
      top
        .setTitle("**Топ сообщений**")
        .setDescription("Любители пообщаться в чате ⬇")
        .setThumbnail(
          "https://media.discordapp.net/attachments/620328811610767370/633696969625305138/6329641183615385601.png?size=1024"
        )
        .setColor(member!.displayColor);

      const fmtUsers: { tag: any; msgc: string }[] = [];

      u.forEach((user) => {
        const member = guild!.members.cache.get(user.userId);
        const tag = member ? member.user.tag : user.id;
        const msgc = `${user.msgCount}`;

        fmtUsers.push({ tag, msgc });
      });

      fmtUsers.forEach((user, place) =>
        top.addField(
          `**#${place + 1} - ${user.tag}**`,
          `**Сообщений:** ${user.msgc}`
        )
      );

      return LoadMessage.edit(top).catch(console.error);
    } else if (args[0].toLowerCase() === "войс-онлайна") {
      let u = docs
        .sort((b, a) => a.online - b.online)
        .array()
        .slice(0, 10);
      if (!u.length) return;

      const top = new Discord.MessageEmbed();
      top
        .setTitle("**Топ войс-онлайна**")
        .setDescription(`Любители поболтать в голосовых каналах ⬇`)
        .setThumbnail(
          "https://images-ext-1.discordapp.net/external/s5eqiWebtzdD6TrH5AfvLoFBWuHiVSW-1i8BuyRxLIQ/%3Fsize%3D1024/https/media.discordapp.net/attachments/620328811610767370/633696969625305138/6329641183615385601.png?size=1024"
        )
        .setColor(member!.displayColor);

      const fmtUsers: { tag: any; online: string }[] = [];

      u.forEach((user) => {
        const member = guild!.members.cache.get(user.userId);
        const tag = member ? member.user.tag : user.id;

        const time = convertSecondsToTime(user.online, true);
        const online = `**${time.h}** ч : **${time.m}** м`;

        fmtUsers.push({ tag, online });
      });

      fmtUsers.forEach((user, place) =>
        top.addField(`**#${place + 1} - ${user.tag}**`, user.online)
      );

      return LoadMessage.edit(top).catch(console.error);
    } else if (args[0].toLowerCase() === "контейнеров") {
      let u = docs
        .sort((b, a) => a.packs - b.packs)
        .array()
        .slice(0, 10);
      if (!u.length) return;

      const top = new Discord.MessageEmbed();
      top
        .setTitle("**Топ контейнеров**")
        .setDescription(`Любители коллекционировать контейнеры ⬇`)
        .setThumbnail(
          "https://media.discordapp.net/attachments/620328811610767370/633696969625305138/6329641183615385601.png?size=1024"
        )
        .setColor(member!.displayColor);

      const fmtUsers: { tag: any; packs: string }[] = [];

      u.forEach((user) => {
        const member = guild!.members.cache.get(user.userId);
        const tag = member ? member.user.tag : user.id;

        const packs = `${user.packs} <:box:632957783318462484>`;

        fmtUsers.push({ tag, packs });
      });

      fmtUsers.forEach((user, place) =>
        top.addField(`**#${place + 1} - ${user.tag}**`, `**${user.packs}**`)
      );

      return LoadMessage.edit(top).catch(console.error);
    } else if (["$", "богачей"].includes(args[0].toLowerCase())) {
      let u = docs
        .sort((b, a) => a.Currency - b.Currency)
        .array()
        .slice(0, 10);
      const emoj = config!.CurrencyLogo;
      if (!u.length) return;

      const top = new Discord.MessageEmbed();
      top
        .setTitle("**Топ богачей**")
        .setDescription(`Звёздные олигархи сервера ⬇`)
        .setThumbnail(
          "https://media.discordapp.net/attachments/620328811610767370/633696969625305138/6329641183615385601.png?size=1024"
        )
        .setColor(member!.displayColor);

      const fmtUsers: { tag: any; Currency: string }[] = [];

      u.forEach((user) => {
        const member = guild!.members.cache.get(user.userId);
        const tag = member ? member.user.tag : user.id;

        const Currency = `**${user.Currency}**${emoj}`;

        fmtUsers.push({ tag, Currency });
      });

      fmtUsers.forEach((user, place) =>
        top.addField(`**#${place + 1} - ${user.tag}**`, user.Currency)
      );

      return LoadMessage.edit(top).catch(console.error);
    } else if (args[0].toLowerCase() === "печенек") {
      let u = docs
        .sort((b, a) => a.cookies - b.cookies)
        .array()
        .slice(0, 10);
      if (!u.length) return;

      const top = new Discord.MessageEmbed();
      top
        .setTitle("**Топ печенек**")
        .setDescription(`Любители собирать печеньки ⬇`)
        .setThumbnail(
          "https://media.discordapp.net/attachments/620328811610767370/633696969625305138/6329641183615385601.png?size=1024"
        )
        .setColor(member!.displayColor);

      const fmtUsers: { tag: any; cookies: string }[] = [];

      u.forEach((user) => {
        const member = guild!.members.cache.get(user.userId);
        const tag = member ? member.user.tag : user.id;

        const cookies = `**${user.cookies}**🍪`;

        fmtUsers.push({ tag, cookies });
      });

      fmtUsers.forEach((user, place) =>
        top.addField(`**#${place + 1} - ${user.tag}**`, user.cookies)
      );

      return LoadMessage.edit(top).catch(console.error);
    } else LoadMessage.delete();
  }
}

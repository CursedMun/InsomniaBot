import { Discord, Core, Document } from "discore.js";
import Constants from "../util/Constants";
import { wholeNumber } from "../util/functions";

export function generateProgressBar(percentage: Number) {
  if (percentage >= 0 && percentage < 10) {
    return `<:00:621318969944571905><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 10 && percentage < 20) {
    return `<:10:621318970313670670><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 20 && percentage < 30) {
    return `<:20:621318969873399809><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 30 && percentage < 40) {
    return `<:20:621318969873399809><:30:621318969969868834><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 40 && percentage < 50) {
    return `<:20:621318969873399809><:40:621318970435305475><:00:621318969944571905><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 50 && percentage < 60) {
    return `<:20:621318969873399809><:40:621318970435305475><:50:621318970267664407><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 60 && percentage < 70) {
    return `<:20:621318969873399809><:40:621318970435305475><:60:621318970191904768><:00:621318969944571905><:00:621318969944571905>`;
  } else if (percentage >= 70 && percentage < 80) {
    return `<:20:621318969873399809><:40:621318970435305475><:60:621318970191904768><:70:621318970351288320><:00:621318969944571905>`;
  } else if (percentage >= 80 && percentage < 90) {
    return `<:20:621318969873399809><:40:621318970435305475><:60:621318970191904768><:80:621318970401751040><:00:621318969944571905>`;
  } else if (percentage >= 90 && percentage < 100) {
    return `<:20:621318969873399809><:40:621318970435305475><:60:621318970191904768><:80:621318970401751040><:90:621318970276052992>`;
  } else if (percentage >= 100) {
    return `<:20:621318969873399809><:40:621318970435305475><:60:621318970191904768><:80:621318970401751040><:100:643557438452400138>`;
  }
}

export function getRequiredExpForLevel(lvl: Number | String) {
  lvl = typeof lvl === "string" ? Number(lvl) : lvl;
  var ready = 7 * (<any>lvl * <any>lvl) + 50 * <any>lvl + 100;
  return ready;
}
export async function levelUpdate(member: Discord.GuildMember, user: Document, core: Core) {
  const guild = member.guild;

  const data = {
    userId: member.id,
  };
  const needXp = getRequiredExpForLevel(Number(user.lvl));

  if (user.xp >= needXp) {
    const LevelUp = Number(user.lvl + 1);
    if (user.lvl == LevelUp) return;
    const updateXp = Math.round(Number(user.xp - needXp));
    user.xp = updateXp;
    user.lvl = LevelUp;
    const notify = new Discord.MessageEmbed()
      .setColor(member.displayColor)
      .setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕`
      );

    let reward = LevelUp * 5;
    user.Currency = user.Currency + reward;
    if (LevelUp === 1) {
      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.one);
      await member.roles.add(role!);
    } else if (LevelUp === 3) {
      user.packs = user.packs + 1;
      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.two);
      await member.roles.add(role!);
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучена **уровневая** роль ${role} и **1** контейнер!`
      );
    } else if (LevelUp === 10) {
      const roleOld = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.two);
      await member.roles.remove(roleOld!);

      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.three);
      await member.roles.add(role!);
      user.packs = user.packs + 2;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучена **уровневая** роль ${role} и **2** контейнера!`
      );
    } else if (LevelUp === 15) {
      user.packs = user.packs + 1;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучен **1** контейнер!`
      );
    } else if (LevelUp === 20) {
      const roleOld = guild.roles.cache.get(
        Constants.Ids.Roles.LevelRoles.three
      );
      await member.roles.remove(roleOld!);

      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.four);
      await member.roles.add(role!);
      user.packs = user.packs + 2;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучена **уровневая** роль ${role} и **2** контейнера!`
      );
    } else if (LevelUp === 30) {
      user.packs = user.packs + 2;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучен **2** контейнер!`
      );
    } else if (LevelUp === 35) {
      const roleOld = guild.roles.cache.get(
        Constants.Ids.Roles.LevelRoles.four
      );
      await member.roles.remove(roleOld!);

      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.five);
      await member.roles.add(role!);
      user.packs = user.packs + 3;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучена **уровневая** роль ${role} и **3** контейнера!`
      );
    } else if (LevelUp === 45) {
      user.packs = user.packs + 3;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучено **3** контейнера!`
      );
    } else if (LevelUp === 50) {
      const roleOld = guild.roles.cache.get(
        Constants.Ids.Roles.LevelRoles.five
      );
      await member.roles.remove(roleOld!);

      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.six);
      await member.roles.add(role!);
      user.packs = user.packs + 5;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучена **уровневая** роль ${role} и **5** контейнеров!`
      );
    } else if (LevelUp === 55) {
      user.packs = user.packs + 10;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучено и **10** контейнеров!`
      );
    } else if (LevelUp === 60) {
      const roleOld = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.six);
      await member.roles.remove(roleOld!);

      const role = guild.roles.cache.get(Constants.Ids.Roles.LevelRoles.seven);
      await member.roles.add(role!);
      user.packs = user.packs + 20;
      await notify.setDescription(
        `Ты не спишь уже **${LevelUp}-й** день. Выпей чашечку кофе☕\nПолучена **уровневая** роль ${role} и **20** контейнеров!`
      );
    }
    let channel = guild.channels.cache.get(
      Constants.Ids.Chs.ServerChats.FloodChat
    ) as Discord.TextChannel;
    console.log(`${member.id} получил уровень ${LevelUp} в ${Date.now()}`);
    await user.save().catch((e) => console.log(e));
    return channel.send(member, notify);
  }
  const afterXp = Number(user.xp);
  const AfterNeedXp = getRequiredExpForLevel(Number(user.lvl + 1));
  if (afterXp >= AfterNeedXp) levelUpdate(member, user, core);
  return await user.save().catch((e) => console.log(e));
}

export async function updateOnline(
  channel: Discord.VoiceChannel | null,
  time: Number,
  member: Discord.GuildMember,
  core: Core
) {
  let userCol = core.db.getCollection("users")!;
  let user = await userCol?.getOne({ userId: member.id })!;
  var PACK_PER_SEC: any = 18000;
  var XP_PER_SEC = 0;
  if (!channel) {
    XP_PER_SEC = 200;
  } else {
    if (["696761489708548206", "743946316220203070", "743946268715515904", "743946786703540356"].some((v) => channel.id == v)) {
      XP_PER_SEC = 150;
    }
    if (channel!.members.filter((m) => !m.voice.deaf && !m.voice.mute).size == 2) {
      XP_PER_SEC = 30;
    }
    if (channel.members.filter((m) => !m.voice.deaf && !m.voice.mute).size >= 3) {
      XP_PER_SEC = 20;
    } if (channel.id == Constants.Ids.Chs.Love.channel) {
      XP_PER_SEC = 200;
    }
  }
  if (XP_PER_SEC == 0) {
    return await userCol.updateOne(
      { userId: member.id },
      {
        online: user.online + time,
        ExperienceOnline: user.online + time,
      }
    );
  }
  user.online = user.online + time;

  if (user.ExperienceOnline < user.online) {
    var ExperienceTime = user.online - user.ExperienceOnline;
    var xppoints = ExperienceTime / XP_PER_SEC;
    if (xppoints > 0) {
      user.ExperienceOnline = user.online;
      user.xp = user.xp + xppoints;
      const hereXp = Number(user.xp);
      const needXp = getRequiredExpForLevel(user.lvl);
      if (hereXp >= needXp) await levelUpdate(member, user, core);
    }
  }

  if (user.PacksOnline < user.online) {
    var PacksTime: any = user.online - user.PacksOnline;
    var packpoints = Math.floor(PacksTime / PACK_PER_SEC);
    if (packpoints > 0) {
      user.PacksOnline = user.online;

      user.packs = user.packs + packpoints;
      console.log(
        `${member.user.tag} получил контейнер за 5 часов ${Date.now()}`
      );
      const notify = new Discord.MessageEmbed()
        .setColor("#ce2626")
        .setTitle(`Поздравляем,`)
        .setDescription(
          `вам выпал контейнер за **5 часов** голосового онлайна!\n\nЧтобы открыть контейнер, используйте команду - "!открыть" во <#605187837628776478>.`
        )
        .setThumbnail(`https://i.imgur.com/xiQO00c.png`);

      member.send(notify).catch(err => console.error(`Не смог отправить смс в лс ${member.user.tag}`));
    }
  }
  return await user.save().catch((e) => console.log(e));
}

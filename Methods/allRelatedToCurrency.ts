import { Core, Mongo, Discord } from "discore.js";
import Constants from "../util/Constants";
import { timeStamp } from "console";
import { isNull, isNullOrUndefined } from "util";

export async function awardPack(
  member: Discord.GuildMember,
  amount: Number,
  core: Core
) {
  const users = core.db.getCollection("users");
  let user = await users?.getOne({ userId: member.id })!;

  user.packs = Number(user.packs + amount);
  return await user?.save().catch(console.error);
}

export async function awardTransaction(
  member: Discord.GuildMember,
  amount: number,
  core: Core,
  transType?: String
) {
  const users = core.db.getCollection("users");
  let user = await users?.getOne({ userId: member.id })!;
  if (isNaN(amount) || isNullOrUndefined(amount)) {
    return false;
  } else {
    user.Currency = Number(user.Currency + amount);
    const channel = core.channels.cache.get(Constants.Ids.Chs.ServerChats.PaymentsChat)! as Discord.TextChannel
    channel.send(new Discord.MessageEmbed().setTitle(transType ? transType : "Транзакция").setColor(53380)
      .setDescription(`Счёт участника ${member} был изменен <a:done:633677830907101216>`).addField("Было:", user.Currency - amount, true).addField("Плюс", amount, true).addField("Стало:", user.Currency, true))
    return await user?.save().catch(console.error);
  }

}

export async function setBalance(
  member: Discord.GuildMember,
  Currency: Number,
  core: Core
) {
  const users = core.db.getCollection("users");
  let user = await users?.getOne({ userId: member.id })!;
  user.Currency = Number(Currency);
  return await user?.save().catch(console.error);
}

export async function setLastDaily(
  member: Discord.GuildMember,
  Daily: Number,
  lastDaily: Number,
  core: Core
) {
  const users = core.db.getCollection("users");
  let user = await users?.getOne({ userId: member.id })!;
  user.Currency = user.Currency + Daily;
  user.lastDaily = lastDaily;
  return await user?.save().catch(console.error);
}

export async function transferPack(
  member: Discord.GuildMember,
  target: Discord.GuildMember,
  amount: number,
  core: Core
) {
  return new Promise(async (resolve) => {
    const res = await withdrawPack(member, amount, core);
    if (!res) resolve(false);
    else {
      await awardPack(target, amount, core);
      resolve(amount);
    }
  });
}

export async function transferTransaction(
  member: Discord.GuildMember,
  target: Discord.GuildMember,
  amount: number,
  core: Core
) {
  return new Promise(async (resolve) => {
    const res = await withdrawTransaction(member, amount, core);
    if (!res) resolve(false);
    else {
      await awardTransaction(target, amount, core);
      resolve(amount);
    }
  });
}

export async function withdrawLoveTaxs(
  member: Discord.GuildMember,
  scndmember: Discord.GuildMember,
  amount: number,
  core: Core
) {
  const users = core.db.getCollection("users")!;

  let user = await users.getOne({ userId: member.id });
  let usertwo = await users.getOne({ userId: scndmember.id });

  return new Promise(async (resolve) => {
    user!.Currency = Number(user!.Currency - amount);
    if (user!.Currency < amount || user!.Currency < 0) {
      resolve(false);
    } else {
      usertwo!.Currency = Number(usertwo!.Currency - amount);
      if (usertwo!.Currency < amount || usertwo!.Currency < 0) {
        resolve(false);
      } else {
        const channel = core.channels.cache.get(Constants.Ids.Chs.ServerChats.PaymentsChat)! as Discord.TextChannel
        channel.send(new Discord.MessageEmbed().setTitle("Налог пар").setDescription(`С пары ${member} и ${scndmember} был снят налог в сумму ${amount}`).setFooter(timeStamp()))
        await user?.save().catch(console.error);
        await usertwo?.save().catch(console.error);
        resolve(amount);
      }
    }
  });
}

export async function withdrawPack(
  member: Discord.GuildMember,
  amount: number,
  core: Core
) {
  const users = core.db.getCollection("users")!;
  let user = await users.getOne({ userId: member.id });
  return new Promise(async (resolve) => {
    user.packs = Number(user.packs - amount);
    if (user.packs < amount || user.packs < 0) {
      resolve(false);
    } else {
      resolve(amount);
      return await user?.save().catch(console.error);
    }
  });
}

export async function withdrawTaxs(id: number, amount: number, core: Core, transType?: String) {
  const clans = core.db.getCollection("clans")!;
  let clan = await clans.getOne({ ClubId: id });
  return new Promise(async (resolve) => {
    clan!.balance = Number(clan!.balance - amount);
    if (clan!.balance < 0 || isNaN(amount) || isNullOrUndefined(amount)) {
      resolve(false);
    } else {
      const channel = core.channels.cache.get(Constants.Ids.Chs.ServerChats.PaymentsChat)! as Discord.TextChannel
      channel.send(new Discord.MessageEmbed().setTitle(transType ? transType : "Налог Клана").setDescription(`С клана <@&${clan.clanRole}>(${clan.name}) была снята сумма ${amount}`).setFooter(new Date()))
      resolve(amount);
      return await clan?.save().catch(console.error);
    }
  });
}

export async function withdrawTransaction(
  member: Discord.GuildMember | Discord.ClientUser,
  amount: number,
  core: Core,
  transType?: String
) {
  const users = core.db.getCollection("users")!;
  let user = await users.getOne({ userId: member.id });
  return new Promise(async (resolve) => {
    user.Currency = Number(user.Currency - amount);
    if (user.Currency < 0 || isNaN(user.Currency) || isNullOrUndefined(amount)) {
      resolve(false);
    } else {
      const channel = core.channels.cache.get(Constants.Ids.Chs.ServerChats.PaymentsChat)! as Discord.TextChannel
      channel.send(new Discord.MessageEmbed().setTitle(transType ? transType : "Транзакция").setColor(53380)
        .setDescription(`Счёт участника ${member} был изменен <a:no_Insomnia:634885617313906738>`).addField("Было:", user.Currency + amount, true).addField("Минус", amount, true).addField("Стало:", user.Currency, true))
      resolve(amount);
      return await user?.save().catch(console.error);
    }
  });
}

import { Discord, Core } from "discore.js";
import Constants from "../util/Constants";
import * as exp from "./allRelatedtoEXP"
import {
  listTimeZones,
  findTimeZone,
  getZonedTime,
  getUnixTime,
} from "timezone-support";

export async function updateMessage(msg: Discord.Message, core: Core) {
  const { member, channel } = msg;
  if (
    channel.id == Constants.Ids.Chs.ServerChats.FloodChat ||
    channel.id == Constants.Ids.Chs.ServerChats.FloodMusic ||
    msg.author.bot
  )
    return;
  if (!member) return;
  let check = await core.db
    .getCollection("users")
    ?.getOne({ userId: member?.id })!;

  check!.msgCount = Number(check!.msgCount) + 1;
  const nativeDate = new Date();
  const russiatime = getZonedTime(nativeDate, findTimeZone("Europe/Moscow"));
  let hours = russiatime.hours;
  if (!core.public.cooldown.get(msg.author.id) || core.public.cooldown.get(msg.author.id).time <= Date.now()) {
    check!.MessageXp =
      hours > 0 && hours < 6
        ? (check!.MessageXp = check!.MessageXp + 25)
        : (check!.MessageXp = check!.MessageXp + 15);
    const update = hours > 0 && hours < 6 ? check!.xp + 25 : check!.xp + 15;
    console.log(
      `${msg.author.username}(${msg.author}) получил ${
      hours > 0 && hours < 6 ? "25" : "15"
      } эксп`
    );
    check!.xp = update;

    await core.public.cooldown.set(msg.author.id, { time: Date.now() + 60000});
  }
  const hereXp = Number(check!.xp);
  const needXp = exp.getRequiredExpForLevel(Number(check!.lvl));
  if (hereXp >= needXp) await exp.levelUpdate(member!, check, core);

  return await check!.save().catch((e) => console.log(e));
}

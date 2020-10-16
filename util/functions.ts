import { Discord, Core, Document } from "discore.js";
import Constants from "./Constants";
import { writeFileSync } from "fs";
import { addUserFromVoice } from "./helpers";
export function isPrivate(channel: Discord.GuildChannel): boolean {
  const privateRoom = Constants.Ids.Chs.Private;
  return (
    channel.id !== privateRoom.channel &&
    channel.parentID === privateRoom.parentID &&
    channel.type == "voice"
  );
}
export function isEvent(channel: Discord.GuildChannel): boolean {
  const eventRoom = Constants.Ids.Chs.Events;
  return (
    channel.id !== eventRoom.channel &&
    channel.parentID === eventRoom.parentID &&
    channel.type == "voice"
  );
}
export function isClanRoom(channel: Discord.GuildChannel): boolean {
  const clanRoom = Constants.Ids.Chs.Clan;
  if (
    !Constants.Ids.Chs.Clan.ToNotDelete.some((v) => channel.id == v)
    &&
    channel.type == "voice"
  )
    return (
      channel.id !== clanRoom.channel && channel.parentID === clanRoom.parentID
    );
  else return false;
}
export function isLoveChannels(channel: Discord.GuildChannel): boolean {
  const LoveChannel = Constants.Ids.Chs.Love;
  return (
    channel.parentID === LoveChannel.parentID &&
    channel.id != Constants.Ids.Chs.Love.channel &&
    channel.type == "voice"
  );
}
export function randomInt(min: number, max: number) {
  return ~~(Math.random() * (max - min + 1)) + min;
}

export function sendError(channel: Discord.TextChannel, text: string) {
  return channel
    .send(
      new Discord.MessageEmbed()
        .setDescription(text)
        .setColor(Constants.Colors.DANGER)
    )
    .then((m: Discord.Message) => {
      m.delete({ timeout: 5000 });
    });
}

export function sendLog(
  channel: Discord.TextChannel,
  title: string,
  desc: string
) {
  return channel.send(
    new Discord.MessageEmbed().setTitle(title).setDescription(desc)
  );
}
export function wholeNumber(val: any) {
  return isNaN(Math.round(val)) ? val : Math.round(val);
}
export async function createChannel(
  member: Discord.GuildMember,
  type: number,
  core: Core,
  inLoveMember?: Discord.GuildMember
) {
  const { guild, displayName } = member;
  const clanRoom = Constants.Ids.Chs.Clan;
  const smallPriv = Constants.Ids.Chs.Private;
  const eventRoom = Constants.Ids.Chs.Events;
  const loveChannel = Constants.Ids.Chs.Love;
  let roleId = null
  try {
    if (type === Constants.Ids.ChannelTypes.ClanChannels) {
      const user = await core.db
        .getCollection("users")
        ?.findOne({ userId: member.id });
      if (!user) return;
      if (
        !member.roles.cache.has(Constants.Ids.Roles.Users.Sponsor) &&
        !user.ClubId
      )
        return;
      if (member.roles.cache.has(Constants.Ids.Roles.Users.Sponsor)) {
        try {
          const userconf = await core.db
            .getCollection("voiceconfigs")
            ?.findOne({ id: member.id, type: 2 });
          await member.guild.channels
            .create(userconf?.voiceName ? userconf.voiceName : "🌟Сон", {
              type: "voice",
              userLimit: userconf?.voiceLimit ? userconf?.voiceLimit : 2,
              parent: clanRoom.parentID,
              permissionOverwrites: [
                {
                  id: member.id,
                  allow: [
                    "PRIORITY_SPEAKER",
                    "VIEW_CHANNEL",
                  ],
                }
              ],
            })
            .then(async (v) => await member.voice.setChannel(v));
        } catch (error) {
          console.log(error);
        }
      } else if (user.ClubId) {
        try {
          const clan = await core.db
            .getCollection("clans")
            ?.findOne({ ClubId: user.ClubId });
          await member.guild.channels
            .create(clan?.name, {
              type: "voice",
              userLimit: clan?.slots,
              parent: clanRoom.parentID,
              permissionOverwrites: [
                {
                  id: clan?.clanRole,
                  allow: ["CONNECT", "VIEW_CHANNEL"],
                },
                {
                  id: member.guild.id,
                  deny: ["CONNECT"],
                },
              ],
            })
            .then(async (v) => {
              await member.voice.setChannel(v);
              v.parent;
            });
          member.guild.channels.cache
            .get(clanRoom.channel)
            ?.createOverwrite(clan?.clanRole, {
              VIEW_CHANNEL: false,
              CONNECT: false,
            });
        } catch (error) {
          console.log(error);
        }
      }
    } else if (type === Constants.Ids.ChannelTypes.Privates) {
      let data: Discord.GuildCreateChannelOptions = {
        type: "voice",
        parent: smallPriv.parentID,
        userLimit: smallPriv.maxUserLimit,
        permissionOverwrites: [
          {
            id: member.id,
            allow: ["PRIORITY_SPEAKER"],
          },
        ],
      };
      const rndSentences = Constants.rndSentences;
      const rndName = () => {
        if (randomInt(1, 100) <= 15) {
          return rndSentences[~~(Math.random() * rndSentences.length)];
        } else {
          return "✨Сон";
        }
      };

      let name: string = rndName();
      if (
        member.roles.cache.has(Constants.Ids.Roles.Users.Sponsor) ||
        member.roles.cache.has(Constants.Ids.Roles.Users.ServerBooster)
      ) {
        const userconf = await core.db
          .getCollection("voiceconfigs")
          ?.findOne({ id: member.id, type: 0 });
        data.userLimit = userconf?.voiceLimit
          ? userconf.voiceLimit
          : smallPriv.maxUserLimit;
        name = userconf?.voiceName ? userconf.voiceName : rndName();
      }
      await guild.channels.create(name, data).then(async (c) => {
        //c.lockPermissions();
        await member.voice.setChannel(c);
      });
    } else if (type === Constants.Ids.ChannelTypes.EventChannels) {
      if (!member.roles.cache.has(Constants.Ids.Roles.Staff.eventCreator))
        return;
      let eventRole = await member.guild.roles.create({
        data: {
          name: "🔰",
        },
      });
      roleId = eventRole.id;
      let textCh: Discord.TextChannel;
      await member.guild.channels.create("🔰Ивент", {
        type: "text",
        parent: eventRoom.parentID,
        permissionOverwrites: [
          {
            id: member.guild.id,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: eventRole.id,
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: Constants.Ids.Roles.Staff.eventCreator,
            allow: ["MANAGE_CHANNELS", "MANAGE_ROLES"],
          },
          {
            id: Constants.Ids.Roles.Staff.curator,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      }).then(ch => {
        textCh = ch;
        ch.send(new Discord.MessageEmbed({
          title: `Ведущий ${member.user.username} просит оценить его!`,
          thumbnail: { url: member.user.avatarURL({ dynamic: true, size: 2048 })! },
          description: "Хотите пожаловаться на проведение ивента или самого ведущего?\nПишите в личные сообщения <@!407998671003582464>",
          color: 53380,
          image: { url: "https://i.imgur.com/pwD0YXs.png" }
        })).then(async m => await m.react("633712359772389386") && await m.react("633712357129977876") && m.pin())
      });
      await member.guild.channels
        .create("🔰Ивент", {
          type: "voice",
          userLimit: 10,
          parent: eventRoom.parentID,
          permissionOverwrites: [
            {
              id: Constants.Ids.Roles.Staff.eventCreator,
              allow: [
                "PRIORITY_SPEAKER",
                "VIEW_CHANNEL",
                "MANAGE_CHANNELS",
                "CONNECT",
                "MUTE_MEMBERS",
                "DEAFEN_MEMBERS",
                "MOVE_MEMBERS",
                "MANAGE_ROLES",
              ],
            },
            {
              id: Constants.Ids.Roles.MiscRoles.eventBan,
              deny: ["CONNECT"],
            },
            {
              id: member.guild.id,
              deny: ["VIEW_CHANNEL"],
            },
            {
              id: Constants.Ids.Roles.Staff.curator,
              allow: ["VIEW_CHANNEL"],
            },
          ],
        })
        .then(async (c) => {

          await member.voice.setChannel(c);
          await member.roles.add(eventRole);
          core.public.objs.createdVoices2.set(c.id, {
            memberID: member.id,
            parentID: c.parentID,
            chID: c.id,
            textID: textCh.id,
            roleID: eventRole.id,
          });
          member.setNickname("! Ведущий").catch(console.error);
        });
    } else if (type === Constants.Ids.ChannelTypes.LoveChannels) {
      const Voices = core.db.getCollection("voiceconfigs")
      const voice = await Voices?.findOne((((d: Document) => (d.id == member!.id || d.idScnd == member!.id) && d.type == 1)))
      let data: Discord.GuildCreateChannelOptions = {
        type: "voice",
        parent: loveChannel.parentID,
        userLimit: loveChannel.maxUserLimit,
        permissionOverwrites: [
          {
            id: inLoveMember!.id,
            allow: ["CONNECT", "USE_VAD", "MOVE_MEMBERS"],
          },
          {
            id: member.id,
            allow: ["CONNECT", "USE_VAD", "MOVE_MEMBERS"],
          },
          {
            id: member.guild.id,
            deny: ["CONNECT"],
          },
          {
            id: Constants.Ids.Roles.MiscRoles.bots,
            allow: ["CONNECT"],
          },
        ],
      };
      await guild.channels.create(voice ? voice.voiceName : "💗Сон", data).then(async (c) => {
        await member.voice.setChannel(c);
        await inLoveMember?.voice.setChannel(c);
      });
    }
    checkAllRooms(guild, core, roleId!);
  } catch (e) {
    console.error(e);
  }
}
export function checkAllRooms(guild: Discord.Guild, core: Core, roleId?: string) {
  const clanRoom = Constants.Ids.Chs.Clan;
  const clanRooms = guild.channels.cache.filter((ch) => isClanRoom(ch));
  clanRooms.forEach(async (channel) => {
    if (channel.members.size == 0) {
      if (channel.name == "🌟Сон") {
        if (channel && channel.deletable)
          channel.delete().catch(console.error);
      } else {
        if (channel && channel.deletable)
          channel.delete().catch(console.error);
        const clan = await core.db
          .getCollection("clans")
          ?.findOne({ name: channel.name });
        let room = guild.channels.cache.get(clanRoom.channel);
        await room
          ?.createOverwrite(clan?.clanRole, {
            VIEW_CHANNEL: true,
            CONNECT: true,
          })
          .catch(console.error);
      }
    }
  });
  guild.channels.cache
    .filter((ch) => isPrivate(ch))
    .forEach((channel) => {
      if (channel.members.size == 0) {
        if (channel && channel.deletable)
          channel.delete().catch(console.error);
      }
    });
  guild.channels.cache
    .filter((ch) => isEvent(ch))
    .forEach((ch) => {
      if (ch && ch.members.size == 0 && ch.deletable) ch.delete().catch(console.error);
      // if (guild.roles.cache.find((r) => r.name == "🔰" && roleId ? r.id != roleId : r.name == "🔰" && r.members.size < 1)) {
      //   guild.roles.cache.find((r) => r.name == "🔰" && roleId ? r.id != roleId : r.name == "🔰" && r.members.size < 1)?.delete().catch(err => console.log("I got error here> " + err));
      // }

    });
  guild.channels.cache
    .filter((ch) => isLoveChannels(ch))
    .forEach((ch) => {
      if (ch && ch.members.size == 0 && ch.deletable) ch.delete().catch(console.error);
    });
  const voiceChannels = guild.channels.cache.filter(ch => ch.type === 'voice');

  voiceChannels.forEach(channel => {
    const channelId = channel.id;
    const members = channel.members;
    const member = members.first();

    if (channelId === guild.afkChannelID) return 0;
    else {
      if (members.size > 0) {
        //if (isPrivate(channel) && members.size == 2) createChannel(member!, Constants.Ids.ChannelTypes.LoveChannels, core, members.array()[1]);
        if (channelId === Constants.Ids.Chs.Clan.channel) createChannel(member!, Constants.Ids.ChannelTypes.ClanChannels, core);
        else if (channelId === Constants.Ids.Chs.Private.channel) createChannel(member!, Constants.Ids.ChannelTypes.Privates, core);
        else if (channelId === Constants.Ids.Chs.Events.channel) createChannel(member!, Constants.Ids.ChannelTypes.EventChannels, core);
      }
      members.forEach(member => {
        if (member.user.bot) return 0;
        else {
          const user = core.public.usersInVoice.get(member.id);
          if (user) return;
          addUserFromVoice(member.id, core);
        }
      })
    }
  })
  return false;
}
export function removeExtraSpaces(arr: string[]) {
  return arr.filter((val) => val !== "");
}
/**
 * Convert unix to time for clans and daily
 * @param unix
 */
export function convertUnixToTime(unix: number) {
  const timeEnd = new Date(unix * 1000);

  let today: any = new Date();
  today = Math.floor((<any>timeEnd - today) / 1000);

  const sec = today % 60;
  today = Math.floor(today / 60);

  const min = today % 60;
  today = Math.floor(today / 60);

  const hour = today % 24;
  today = Math.floor(today / 24);

  return { hour, min, sec };
}
/**
 * Convert unix time to full time date for roles
 * @param unix Unix Time
 */
export function convertUnixToFULL(unix: number) {
  const timeEnd = new Date(unix * 1000);

  let today: any = new Date();
  today = Math.floor((<any>timeEnd - today) / 1000);

  const sec = today % 60;
  today = Math.floor(today / 60);

  const min = today % 60;
  today = Math.floor(today / 60);

  const hour = today % 24;
  today = Math.floor(today / 24);

  const day = today;
  today = Math.floor(today / 7);

  return { day, hour, min, sec };
}
/**
 * Convert Seconds for next pack
 * @param seconds
 * @param usePad
 */
export function convertSecondsToTime(seconds: number, usePad = false) {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  minutes = minutes % 60;

  const pad = (num: number) => {
    const n = num.toString();
    return n;
  };

  return {
    h: usePad ? pad(hours) : hours,
    m: usePad ? pad(minutes) : minutes,
  };
}

/**
 * Write something to the file probably I wanted to do something but forgot p.s duh...
 * @param file
 * @param text
 */
export function writetofile(file: string, text: string) {
  writeFileSync(file, text);
}

import { Event, Discord, Core, Document } from "discore.js";
import Constants from "../util/Constants";
import * as helper from "../util/helpers";
import * as functions from "../util/functions";
import * as exp from "../Methods/allRelatedtoEXP";
import { memory } from "console";
class VoiceJoin extends Event {
  get options() {
    return { name: "voiceChannelJoin" };
  }
  async run(oldState: Discord.VoiceState, newState: Discord.VoiceState) {
    if (oldState.member?.user.bot || newState.member?.user.bot) return;
    helper.addUserFromVoice(newState.member?.id, this.client);
    let timeToWait = Math.floor(1000);
    const client = this.client;
    if (newState.channelID === Constants.Ids.Chs.Events.channel) {
      //event rooms
      const chann = newState.guild.channels.cache.get(
        Constants.Ids.Chs.Events.channel
      );

      function func() {
        if (chann?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.EventChannels,
            client
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (newState.channelID === Constants.Ids.Chs.Clan.channel) {
      //Clan rooms
      const chann = newState.guild.channels.cache.get(
        Constants.Ids.Chs.Clan.channel
      );
      function func() {
        if (chann?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.ClanChannels,
            client
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (newState.channelID === Constants.Ids.Chs.Private.channel) {
      //small rooms
      const chann = newState.guild.channels.cache.get(
        Constants.Ids.Chs.Private.channel
      );
      function func() {
        if (chann?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.Privates,
            client
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (
      newState.channel?.userLimit == 2 &&
      newState.channel.members.size == 2 &&
      newState.channel.parentID == Constants.Ids.Chs.Private.parentID
    ) {
      const users = this.client.db.getCollection("users");
      const member = await users?.findOne({ userId: newState.member?.id });
      if (
        !member ||
        !member!.relationship ||
        !newState.channel.members.has(member!.relationship)
      )
        return;
      function func() {
        if (newState.channel?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.LoveChannels,
            client,
            newState.guild.members.cache.get(member!.relationship)
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (newState.channelID === newState.guild.afkChannelID) {
      //afk room
      helper.removeUserFromVoice(client, newState.member?.id!);
    }
    if (this.client.public.objs.createdVoices2.has(newState.channel?.id)) {
      newState.member?.roles.add(
        this.client.public.objs.createdVoices2.get(newState.channel?.id).roleID
      );
    }
    return newState.member?.roles
      .add(Constants.Ids.Roles.MiscRoles.voice)
      .catch((err) => console.log(err));

  }
}

class VoiceSwitch extends Event {
  get options() {
    return { name: "voiceChannelSwitch" };
  }

  async run(oldState: Discord.VoiceState, newState: Discord.VoiceState) {
    if (oldState.member?.user.bot || newState.member?.user.bot) return;
    if (this.client.public.objs.createdVoices2.has(newState.channel?.id)) {
      newState.member?.roles.add(
        this.client.public.objs.createdVoices2.get(newState.channel?.id).roleID
      );
    }
    if (
      this.client.public.objs.createdVoices2.has(oldState.channel?.id) &&
      newState.member?.roles.cache.find((r) => r.name == "🔰")
    ) {
      newState.member?.roles.remove(
        this.client.public.objs.createdVoices2.get(oldState.channel?.id).roleID
      ).catch(console.error);
    }

    if (
      oldState.channel?.members.size == 0 &&
      functions.isPrivate(oldState.channel)
    ) {
      if (oldState.channel && oldState.channel.deletable)
        oldState.channel.delete().catch(console.error);
    } else if (
      oldState.channel?.members.size == 0 &&
      functions.isClanRoom(oldState.channel)
    ) {
      if (oldState.channel.name == "🌟Сон") {
        if (oldState.channel && oldState.channel.deletable)
          oldState.channel.delete().catch(console.error);
      } else {
        try {
          if (oldState.channel && oldState.channel.deletable)
            oldState.channel.delete().catch(console.error);
          let clans = this.client.db.getCollection("clans");
          const clan = await clans!.findOne({ name: oldState.channel.name });
          await oldState.guild.channels.cache
            .get(Constants.Ids.Chs.Clan.channel)
            ?.createOverwrite(clan!.clanRole, {
              VIEW_CHANNEL: true,
              CONNECT: true,
            });
        } catch (error) {
          console.log(error);
        }
      }
    } else if (
      oldState.channel?.members.size == 0 &&
      functions.isEvent(oldState.channel)
    ) {
      let event = this.client.public.objs.createdVoices2.get(
        oldState.channelID
      );
      if (!event) return;
      oldState.guild.members.cache.get(this.client.public.objs.createdVoices2.get(oldState.channelID).memberID)?.setNickname("")
      if (oldState.channel && oldState.channel.deletable)
        oldState.channel.delete().catch(console.error);
      oldState.guild.channels.cache
        .get(event.textID)
        ?.delete()
        .catch(console.error);
      oldState.guild.roles.cache
        .get(event.roleID)
        ?.delete()
        .catch(console.error);
      this.client.public.objs.createdVoices2.delete(oldState.channelID);
    } else if (
      oldState.channel?.members.size == 0 &&
      functions.isLoveChannels(oldState.channel)
    ) {
      if (oldState.channel && oldState.channel.deletable)
        oldState.channel.delete().catch(console.error);
    }
    let timeToWait = Math.floor(1000);
    const client = this.client;
    if (newState.channelID === Constants.Ids.Chs.Events.channel) {
      //event rooms
      const chann = newState.guild.channels.cache.get(
        Constants.Ids.Chs.Events.channel
      );

      function func() {
        if (chann?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.EventChannels,
            client
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (newState.channelID === Constants.Ids.Chs.Clan.channel) {
      //Clan rooms
      const chann = newState.guild.channels.cache.get(
        Constants.Ids.Chs.Clan.channel
      );
      function func() {
        if (chann?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.ClanChannels,
            client
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (newState.channelID === Constants.Ids.Chs.Private.channel) {
      //small rooms
      const chann = newState.guild.channels.cache.get(
        Constants.Ids.Chs.Private.channel
      );
      function func() {
        if (chann?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.Privates,
            client
          );
        }
      }
      setTimeout(func, timeToWait);
    } else if (
      newState.channel?.userLimit == 2 &&
      newState.channel.members.size == 2 &&
      newState.channel.parentID == Constants.Ids.Chs.Private.parentID
    ) {
      const users = this.client.db.getCollection("users");
      let member = await users?.findOne({ userId: newState.member?.id });
      if (
        !member ||
        !member!.relationship ||
        !newState.channel.members.has(member!.relationship)
      )
        return;
      function func() {
        if (newState.channel?.members.size == 0) return;
        else {
          functions.createChannel(
            newState.member!,
            Constants.Ids.ChannelTypes.LoveChannels,
            client,
            newState.guild.members.cache.get(member!.relationship)
          );
        }
      }
      setTimeout(func, timeToWait);
    }
  }
}

class VoiceLeave extends Event {
  get options() {
    return { name: "voiceChannelLeave" };
  }

  async run(oldState: Discord.VoiceState, newState: Discord.VoiceState) {
    if (oldState.member?.user.bot || newState.member?.user.bot) return;
    if (
      oldState.channel?.members.size == 0 &&
      functions.isPrivate(oldState.channel)
    ) {
      if (oldState.channel && oldState.channel.deletable)
        oldState.channel.delete().catch(console.error);
    } else if (
      oldState.channel?.members.size == 0 &&
      functions.isClanRoom(oldState.channel)
    ) {
      if (oldState.channel.name == "🌟Сон") {
        if (oldState.channel && oldState.channel.deletable)
          oldState.channel.delete().catch(console.error);
      } else {
        try {
          if (oldState.channel && oldState.channel.deletable)
            oldState.channel.delete().catch(console.error);
          let clans = this.client.db.getCollection("clans");
          const clan = await clans!.findOne({ name: oldState.channel.name });
          if (clan)
            await oldState.guild.channels.cache
              .get(Constants.Ids.Chs.Clan.channel)
              ?.createOverwrite(clan!.clanRole, {
                VIEW_CHANNEL: true,
                CONNECT: true,
              });
        } catch (error) {
          console.log(error);
        }
      }
    } else if (
      oldState.channel?.members.size == 0 &&
      functions.isEvent(oldState.channel)
    ) {

      let event = this.client.public.objs.createdVoices2.get(oldState.channelID);
      if (event) {
        oldState.guild.members.cache.get(this.client.public.objs.createdVoices2.get(oldState.channelID).memberID)?.setNickname("")
        if (oldState.channel && oldState.channel.deletable)
          oldState.channel.delete().catch(console.error);
        oldState.guild.channels.cache
          .get(event.textID)
          ?.delete()
          .catch(console.error);
        oldState.guild.roles.cache
          .get(event.roleID)
          ?.delete()
          .catch(console.error);
        this.client.public.objs.createdVoices2.delete(oldState.channelID);
      } else {
        if (oldState.channel && oldState.channel.deletable)
          oldState.channel.delete().catch(console.error);
        if (oldState.member?.roles.cache.find(r => r.name == "🔰"))
          oldState.member?.roles.remove(
            oldState.member?.roles.cache.find(r => r.name == "🔰")!
          ).catch(console.error);

      }
    } else if (
      oldState.channel?.members.size == 0 &&
      functions.isLoveChannels(oldState.channel)
    ) {
      if (oldState.channel && oldState.channel.deletable)
        oldState.channel.delete().catch(console.error);
    }
    if (
      this.client.public.objs.createdVoices2.has(oldState.channel?.id) &&
      oldState.member?.roles.cache.find((r) => r.name == "🔰")
    ) {
      oldState.member?.roles.remove(
        this.client.public.objs.createdVoices2.get(oldState.channel?.id).roleID
      ).catch(console.error);
    }
    const dateNow = Date.now();

    const userInVoice = this.client.public.usersInVoice.get(
      oldState.member?.id || newState.member?.id
    );
    if (userInVoice) {
      const online = (dateNow - userInVoice.time) / 1000;
      if (online > 0)
        await exp.updateOnline(
          oldState.channel as Discord.VoiceChannel,
          online,
          oldState.member!,
          this.client
        );
    }

    newState.member?.roles.remove(Constants.Ids.Roles.MiscRoles.voice);
    return this.client.public.usersInVoice.delete(oldState.member?.id);
  }
}

class ChannelDelete extends Event {
  get options() {
    return { name: "channelDelete" };
  }

  run(channel: Discord.VoiceChannel) {
    if (this.client.public.objs.createdVoices2.has(channel.id))
      channel.guild.roles.cache.delete(
        this.client.public.objs.createdVoices2.get(channel.id).roleID
      );
  }
}
export =[VoiceJoin, VoiceSwitch, VoiceLeave, ChannelDelete];

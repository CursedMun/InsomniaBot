import { Event, Discord, Core, Document } from "discore.js";
import Constants from "../util/Constants";
import { updateBotPresence, removeUserFromVoice } from "../util/helpers";

class MemberRemove extends Event {
  get options() {
    return { name: "guildMemberRemove" };
  }

  async run(member: Discord.GuildMember) {
    const Users = this.client.db.getCollection("users")!;
    const clans = this.client.db.getCollection("clans")!;
    const LoveTaxs = this.client.db.getCollection("LoveTaxs")!;
    const Unixes = this.client.db.getCollection("unixes")!;
    const UserClubDeposits = this.client.db.getCollection("userclubdeposits")!;
    removeUserFromVoice(this.client, member.id);
    updateBotPresence(this.client);
    const guild = this.client.guilds.cache.get(Constants.Ids.guilds[0])!;
    if (guild.id != member.guild.id) return;
    const user = await Users.getOne({ userId: member.id });
    if (user!.isClubOwner == 1) {
      const clan = await clans.findOne({ ClubId: user!.ClubId })


      const members = await Users.filter({ ClubId: clan!.ClubId });
      members.forEach(async (m: Document) => {
        await Users.updateOne({ userId: m.userId }, { ClubId: null });
      });
      await clans.deleteOne({ ClubId: clan!.ClubId });
      guild.roles.cache.get(clan!.clanRole)!.delete().catch();
    }
    if (user!.relationship) {
      await LoveTaxs.deleteOne(((d: Document) => d.idone == user!.userId || d.idscnd == user!.userId));
      const loveuser = await Users.findOne({ userId: user!.relationship })
      loveuser!.relationship = null
      await loveuser?.save().catch(console.error)
    }

    const unix = await Unixes.filter({ userId: user!.userId })
    unix.forEach(async (uni: Document) => {
      if (uni.Type == 3 || uni.Type == 1) {
        await guild.roles.cache.get(uni.role)?.delete()
      }
      await Unixes.deleteOne({ _id: uni._id })
    });
    await UserClubDeposits.deleteMany({ userId: user!.userId });

    await Users.deleteOne({ _id: user!._id });
  }
}
class MemberAdd extends Event {
  get options() {
    return { name: "guildMemberAdd" };
  }
  async run(member: Discord.GuildMember) {
    updateBotPresence(this.client);
  }
}
export =[MemberRemove, MemberAdd];

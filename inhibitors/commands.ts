import { Inhibitor, Discord, Command } from "discore.js";
import Constants from "../util/Constants";
let userUsed = new Set();
export default class extends Inhibitor {
  async run(message: Discord.Message, cmd: Command) {
    const clan = await this.client.db.getCollection("clans")?.findOne({ clanChat: message.channel.id })
    if (!cmd.custom.global && cmd.custom.global != true) {
      if (!message.member!.hasPermission("ADMINISTRATOR") && !message.member?.roles.cache.get(Constants.Ids.Roles.Staff.moderator) && Constants.Ids.guilds.includes(message.guild!.id)) {
        if (Constants.Ids.Chs.ServerChats.FloodChat != message.channel.id
          && !clan) {
          return
        }
      }
      if (!message.member!.hasPermission("ADMINISTRATOR") && !message.member?.roles.cache.get(Constants.Ids.Roles.Staff.moderator)) {
        if (clan && cmd.custom.group != "clans") return
      }
    }
    console.log(cmd.name + " : " + message.member?.user.username)
    let bool = false;
    if (userUsed.has(message.author.id))
      message.reply(
        "подождите 5 секунд, прежде чем использовать следующую команду"
      );
    else {
      if (
        !message.member?.hasPermission("ADMINISTRATOR")
      ) {
        userUsed.add(message.author.id);
        bool = true;
      } else {
        bool = true;
      }

      setTimeout(() => {
        userUsed.delete(message.author.id);
      }, 5000); // 5 secs
    }
    return bool;
  }
}

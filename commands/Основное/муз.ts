import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
const clientInfo = {
  "282859044593598464": {
    prefix: "(!плей)",
    services: "<:youtube:744561013118074900>",
  },
  "184405311681986560": {
    prefix: "(=play)",
    services:
      "<:youtube:744561013118074900>",
  },
  "235088799074484224": {
    prefix: "(.p)",
    services:
      "<:soundcloud:744560959481446473> <:youtube:744561013118074900>",
  },
  "252128902418268161": {
    prefix: "(>p)",
    services:
      "<:soundcloud:744560959481446473> <:youtube:744561013118074900>",
  },
  "284035252408680448": {
    prefix: "(%play)",
    services:
      "<:soundcloud:744560959481446473> <:spotify:744560993455308882> <:youtube:744561013118074900>",
  },

  "234395307759108106": {
    prefix: "(-play)",
    services: "<:soundcloud:744560959481446473> <:spotify:744560993455308882> <:spotify:744560993455308882>",
  },
};
type SpecialString =
  | "234395307759108106"
  | "282859044593598464"
  | "284035252408680448"
  | "184405311681986560"
  | "235088799074484224"
  | "252128902418268161";
export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Основное",
      help: "Проверить статус музыкальных ботов (занят/доступен)",
      syntax: `${this.client.prefix}муз`,
      example: `${this.client.prefix}муз`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel } = message;
    try {
      let bots = ["234395307759108106", "282859044593598464", "284035252408680448", "184405311681986560", "235088799074484224", "252128902418268161"];
      let i = 0;
      const notif = new Discord.MessageEmbed()
        .setColor(message.member!.displayColor)
        .setTitle("Статус музыкальных ботов")
      notif.addField(`**1.${guild!.members.cache.find(t => t.id == bots[0])!.user.username} (-play)**`, `**-** ${guild!.members.cache.find(t => t.id == bots[0])!.voice.channel ? "Занят <:dnd:659301370117226506>" : "Не занят <:online:659301295265677312>"}`, true)
      notif.addField(`**2.${guild!.members.cache.find(t => t.id == bots[1])!.user.username} (!плей)**`, `**-** ${guild!.members.cache.find(t => t.id == bots[1])!.voice.channel ? "Занят <:dnd:659301370117226506>" : "Не занят <:online:659301295265677312>"}`, true)
      notif.addField(`**3.${guild!.members.cache.find(t => t.id == bots[2])!.user.username} (%play)**`, `**-** ${guild!.members.cache.find(t => t.id == bots[2])!.voice.channel ? "Занят <:dnd:659301370117226506>" : "Не занят <:online:659301295265677312>"}`, true)
      notif.addField(`**4.${guild!.members.cache.find(t => t.id == bots[3])!.user.username} (=play)**`, `**-** ${guild!.members.cache.find(t => t.id == bots[3])!.voice.channel ? "Занят <:dnd:659301370117226506>" : "Не занят <:online:659301295265677312>"}`, true)
      notif.addField(`**5.${guild!.members.cache.find(t => t.id == bots[4])!.user.username} (.p)**`, `**-** ${guild!.members.cache.find(t => t.id == bots[4])!.voice.channel ? "Занят <:dnd:659301370117226506>" : "Не занят <:online:659301295265677312>"}`, true)
      notif.addField(`**6.${guild!.members.cache.find(t => t.id == bots[5])!.user.username} (>p)**`, `**-** ${guild!.members.cache.find(t => t.id == bots[5])!.voice.channel ? "Занят <:dnd:659301370117226506>" : "Не занят <:online:659301295265677312>"}`, true)

      // bots1.forEach(b =>{
      //   i++;
      //   console.log(guild.members.find(t => t.id == b))

      // })
      return channel.send(notif)
    } catch (error) {
      console.log("МУЗСТАТУС-ОШИБОЧКА")
      return message.reply("Произошла ошибка").then(msg => msg.delete({timeout: 12000}))
    }
  }
  // async run(message: Discord.Message, args: string[]) {
  //   const bots = Object.keys(clientInfo)
  //     .map((b) => message.guild!.members.cache.get(b))
  //     .filter(Boolean);
  //   if (bots.length < 1) return;

  //   await Promise.all(
  //     bots.map(async (b) => {
  //       const status =
  //         typeof b!.voice.channelID === "string"
  //           ? "<a:no_Insomnia:634885617313906738>"
  //           : "<a:done:633677830907101216>";
  //       const id: any = b!.id;
  //       const idx: SpecialString = id;
  //       const { prefix, services } = clientInfo[idx];
  //       let voiceInvite;
  //       if (
  //         b!.voice.channelID &&
  //         (b!.voice.channel!.userLimit < 1 ||
  //           b!.voice.channel!.members.size < b!.voice.channel!.userLimit)
  //       ) {
  //         const invite = await b!.voice.channel!.createInvite({
  //           temporary: false,
  //           maxAge: 0,
  //           maxUses: 0,
  //           unique: false,
  //         });
  //         if (invite) voiceInvite = `https://discord.gg/${invite.code}`;
  //       }

  //       return [
  //         `<@${b!.id}> ${status}`,
  //         ...(voiceInvite ? [`[Подключиться](${voiceInvite})`] : []),
  //         `> Префикс: ${prefix}`,
  //       ].join("\n");
  //     })
  //   ).then((res) => {
  //     const embedDescription = [res.join("\n\n")].join("\n");
  //     const embed = new Discord.MessageEmbed({
  //       color: 0x2f3137,
  //       title: "Музыкальная станция:",
  //       description: embedDescription,
  //     });

  //     message.channel.send(embed).catch(() => { });
  //   });
  // }
}

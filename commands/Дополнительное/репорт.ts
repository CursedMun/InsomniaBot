import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { randomHexColor } from "../../util/helpers";
import { removeExtraSpaces } from "../../util/functions";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      global: true,
      group: "Дополнительное",
      help: "Пожаловаться администрации на @user",
      syntax: `${this.client.prefix}репорт @участник [причина]`,
      example: `${this.client.prefix}репорт @user Саундпад`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { channel, guild, member, content } = message;
    message.delete().catch(console.error)
    const channelz = guild!.channels.cache.get(
      Constants.Ids.Chs.ServerChats.AdminChat
    )! as Discord.TextChannel;
    const voiceChannel = member?.voice.channel;
    const user =
      message.mentions.members!.first() ||
      message.guild?.members.cache.get(args[0])!;
    if (!user) return;
    const msgArr = content.split(" ");
    const arg = removeExtraSpaces(msgArr.slice(2));

    const reason = arg.join(" ");
    const notify = new Discord.MessageEmbed()
      .setColor(randomHexColor())
      .setTitle(`Жалоба`)
      .setFooter(`После рассмотрения жалобы нажмите "✅"!`);
    const TextChat: Discord.TextChannel = message.channel as Discord.TextChannel
    if (voiceChannel) {
      const invite = await voiceChannel.createInvite();
      notify.setDescription(
        `\n **От:** ${member}\n **На:** ${user} \n **Содержание:**\n ${reason}\n **Из войс-канала:** [\`\`${voiceChannel.name}\`\`](https://discord.gg/${invite.code})`
      );
    } else
      notify.setDescription(
        `\n **От:** ${member}\n **На:** ${user} \n **Содержание:**\n ${reason}\n **Из канала:** [${TextChat}]`
      );
    member?.send(`${member}, успешно отправлено, ждите рассмотрения репорта!`)
    return channelz
      .send(`<@&508706031338127360> | <@&509465866270933008>`, notify)
      .then(async (m) => {
        await m.react("✅");

        const filter = (
          react: Discord.MessageReaction,
          user: Discord.ClientUser
        ) =>
          react.emoji.name === "✅" &&
          [
            Constants.Ids.Roles.Staff.administrator,
            Constants.Ids.Roles.Staff.moderator,
          ].some((r) => guild?.members.cache.get(user.id)?.roles.cache.has(r));
        const collector = m.createReactionCollector(filter, { time: 9000000 });

        collector.on("collect", async (reaction) => {
          switch (reaction.emoji.toString()) {
            case "✅":
              const responder = (await reaction.users.fetch()).first();

              const EditMsg = new Discord.MessageEmbed()
                .setColor(randomHexColor())
                .setTitle(`Жалоба`)
                .setDescription(
                  `\n **От:** ${member}\n **На:** ${user} \n **Содержание:**\n ${reason}\n **Принята:** ${responder}`
                );
              await m.delete();
              channelz.send(EditMsg);

              break;
          }
        });
      });
  }
}

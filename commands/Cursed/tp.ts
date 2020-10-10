import { Command, Discord } from "discore.js";
import { MessageAttachment } from "discord.js"
import Constants from "../../util/Constants";
import Canvas from "canvas";
import snekfetch from "snekfetch";
export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Dev,
    };
  }
  get customOptions() {
    return {
      group: "Cursed",
      help: "Test",
      syntax: `${this.client.prefix}test`,
      example: `${this.client.prefix}test`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { guild, channel, mentions, member } = message;
    const memberId = member!.id;
    const target =
      mentions.members!.first() ||
      guild!.members.cache.get(args[0])
    const canvas = Canvas.createCanvas(1101, 987);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(
      "https://cdn.discordapp.com/attachments/590535605885337603/696777447919583312/ca721368538f3ef2.png"
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#ffffff";

    ctx.fillText(`1`, 145, 232);
    ctx.fillText(`1`, 173, 274);
    ctx.fillText(`1`, 117, 316);
    ctx.fillText(`1`, 400, 232);
    ctx.fillText(`1`, 440, 273);
    ctx.fillText(`1`, 230, 178);
    ctx.fillText(`1`, 400, 316);
    ctx.font = "28px Arial";
    ctx.fillStyle = "#ffffff";

    //let progress = ((userFind.dataValues.user_points_count - (userFind.dataValues.user_lvl * 1000)) * 317) / 1000;
    //progress = Math.round((progress / 317) * 317);

    ctx.font = "28px Arial";
    ctx.fillStyle = "#5f5f5f";

    // ctx.beginPath();
    // ctx.moveTo(155, 117);
    // ctx.lineTo(155 + progress, 117);
    // ctx.lineTo(155 + progress, 150);
    // ctx.lineTo(155, 150);
    // ctx.lineTo(155, 117);
    ctx.fill();
    ctx.closePath();
    const { body: buffer } = await snekfetch.get(target?.user.displayAvatarURL({ dynamic: true })!);
    //const avatar = await Canvas.loadImage(buffer);
    //ctx.drawImage(avatar, 744, 171, 482, 166);
    //1067,483,741,166
    const attachment = new MessageAttachment(canvas.toBuffer(), "profile.png");
    return message.channel.send(attachment);
    // const profile = new RichEmbed()
    //   .setColor(selected.displayColor)
    //   .setAuthor(`💤Профиль ${selected.user.username}`, `${selected.user.displayAvatarURL}`)
    // profile.setImage(`https://i.imgur.com/FuCDm96.gif`)
    //   .setDescription(`**\`\`\`ini\n[${userStatus}]\`\`\`**`, false)
    //   .addField('<:voice:632921100388401182> Войс-онлайн', `**\`\`\`${time.h}ч : ${time.m}м\`\`\`**`, true)
    //   .addField('<:sms2:632962121600335872> Сообщений', `**\`\`\`${user.msgCount}\`\`\`**`, true)
    //   .addField(`<:top_IN:632964118361538560> Топ`, `**\`\`\`#${topOnline + 1}\`\`\`**`, true)
    // if (user.PacksOnline == 0) {
    //   profile.addField('<:box:632957783318462484> До контейнера', `**\`\`\`${PackNone.h}ч : ${PackNone.m}м\`\`\`**`, true)
    // } else {
    //   profile.addField('<:box:632957783318462484> До контейнера', `**\`\`\`${PackTime.h}ч : ${PackTime.m}м\`\`\`**`, true)
    // }
    // profile.addField(`<:love_insomnia:634781545336537088> Пара`, `**\`\`\`${relation}\`\`\`**`, true)
    //   .addField(`<:Clans_insomnia:634785677598392340> Сообщество`, `**\`\`\`${club}\`\`\`**`, true)
    // profile.addField(`<:topMoney:632970895496839198> Уровень: ${user.lvl}`, `${progressBar(progress)} **${Math.round(progress)}%**`, true)
    //   .addField(`<:invent:634788552391000095> Инвентарь:`, `
    //     \n${config.CurrencyLogo}** \`${user.Currency}\`** ${emoji}** \`${user.packs}\`** 🍪** \`${user.cookies}\`**`, false)
    // profile.setTitle(`Статус:`)
    // return channel.send(profile).catch(console.error)
  }
}

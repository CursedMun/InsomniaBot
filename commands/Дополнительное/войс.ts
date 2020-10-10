import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { convertUnixToTime, removeExtraSpaces } from "../../util/functions";
import { unixTime } from "../../util/helpers";
const UserTimeout = new Map<String, number>()
export default class extends Command {
    get options() {
        return { aliases: ["в"] };
    }
    get customOptions() {
        return {
            group: "Дополнительное",
            help: "Изменить название вашего текущего голосового канала",
            syntax: `${this.client.prefix}войс [название]`,
            example: `${this.client.prefix}войс Инсомния💤`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, mentions, content, member } = message;
        const msgArr = content.split(" ");
        const arg = removeExtraSpaces(msgArr.slice(1));

        const name = arg.join(" ");
        if (!name) return;
        const my_channel = guild!.channels.cache.get(member!.voice.channel! ? member!.voice.channel!.id : "0");
        if (!my_channel)
            return message
                .reply("вы должны находится в голосовом канале")
                .then((msg) => msg.delete({ timeout: 15000 }));
        const permissions = my_channel.permissionsFor(message.author.id);
        if (!permissions!.has("PRIORITY_SPEAKER"))
            return message
                .reply("недостаточно прав")
                .then((msg) => msg.delete({ timeout: 15000 }));
        if (UserTimeout.has(member!.id) && unixTime() <= UserTimeout.get(member!.id)!) {
            const time = convertUnixToTime(UserTimeout.get(member!.id)!);
            let through =
                time.hour >= 1 && time.hour <= 24
                    ? `${time.hour} ч.`
                    : time.min > 0 && time.min <= 60
                        ? `${time.min} м.`
                        : `${time.sec} с.`;

            return message.reply(new Discord.MessageEmbed().setColor(member!.displayColor)
                .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
                )
                .setDescription(
                    `Ты уже менял название своего канала!\nДо следующей смены подождите **${through}**`
                )
                .setFooter(`Придётся подождать😴`));
        }
        if (
            (member?.roles.cache.has(Constants.Ids.Roles.Users.Sponsor)) ||
            (member?.roles.cache.has(Constants.Ids.Roles.Users.ServerBooster))
        ) {
            let voiceconfig = this.client.db.getCollection("voiceconfigs");
            let smth = await voiceconfig?.getOne({ id: member.id, type: 0 });
            smth!.voiceName = name;
            await smth!.save().catch((e) => console.log(e));
        }

        const time = unixTime() + 600
        UserTimeout.set(member!.id, time)
        my_channel.edit({ name: name }).then(ch => { return message.reply(` вы успешно изменили название канала на \`${name}\``) })

    }
}

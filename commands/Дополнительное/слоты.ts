import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { convertUnixToTime, isPrivate, removeExtraSpaces, wholeNumber } from "../../util/functions";
import { isNumber } from "util";
import { unixTime } from "../../util/helpers";
const UserTimeout = new Map<String, number>()
export default class extends Command {
    get options() {
        return { aliases: ["с"] };
    }
    get customOptions() {
        return {
            group: "Дополнительное",
            help: "Изменить количество слотов. От 1 до 99",
            syntax: `${this.client.prefix}слоты [1-99]`,
            example: `${this.client.prefix}слоты 5`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, mentions, content, member } = message;
        const number = wholeNumber(Number(args[0]))

        if (!number || number < 0 || number > 99 || typeof (number) != "number" || !Number.isInteger(number)) return;
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
                    `Ты уже менял слоты своего канала!\nДо следующей смены подождите **${through}**`
                )
                .setFooter(`Придётся подождать😴`));
        }
        if (
            (member?.roles.cache.has(Constants.Ids.Roles.Users.Sponsor)) ||
            (member?.roles.cache.has(Constants.Ids.Roles.Users.ServerBooster))
        ) {
            const voiceconfig = this.client.db.getCollection("voiceconfigs");
            let smth = await voiceconfig?.getOne({ id: member.id, type: isPrivate(my_channel) ? 0 : 2 });
            smth!.voiceLimit = number;
            await smth!.save().catch((e) => console.log(e));
        }
        const time = unixTime() + 600
        UserTimeout.set(member!.id, time)
        my_channel.edit({ userLimit: number }).then(ch => { return message.reply(` вы успешно изменили количество слотов в канале на \`${number}\``) })

    }
}

import { Command, Discord, Document } from "discore.js";
import Constants from "../../util/Constants";
import { convertUnixToFULL, removeExtraSpaces } from "../../util/functions";

export default class extends Command {
    get options() {
        return {
        };
    }
    get customOptions() {
        return {
            group: "Основное",
            help: "Посмотреть свой инвентарь",
            syntax: `${this.client.prefix}инвентарь`,
            example: `${this.client.prefix}инвентарь`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, member, mentions, author } = message;
        const target = (mentions.members!.first() ||
            guild!.members.cache.get(args[0]) ||
            message.member)!;
        const Unixes = this.client.db.getCollection("unixes");
        const Users = this.client.db.getCollection("users")!
        const user = await Users.findOne({ userId: target.id })!;
        const { inventory } = user || { inventory: new Map() };
        const map = new Map(Object.entries(inventory));
        // if ([...map.values()].filter((v: any) => v.count > 0).length < 1) {
        //     const embed = new Discord.MessageEmbed({
        //         color: 0x2f3136,
        //         description:
        //             'Ваше хранилище пустует.\nПриобретите что-нибудь в магазине.',
        //     });
        //     return channel.send(embed);
        // }
        const items = await Unixes?.findOne((x: Document) => x.Type == 4 && x.userId == target!.id)
        let through = "";
        if (items != null) {
            const time = convertUnixToFULL(items.time);

            if (time.day) through += `${time.day}д`;
            else if (time.hour) through += `${time.hour}ч`;
            else if (time.min) through += `${time.min}м `;
        }

        let em = new Discord.MessageEmbed()
            .setColor(0x2f3136)
            .setThumbnail(
                "https://i.imgur.com/GXS7SYU.png"
            )
            .setTitle(`**Хранилище | ${target!.user.tag}**`)
            .setDescription(`${[...map.values()]
                .filter((v: any) => v.count > 0)
                .map(
                    (v: any) =>
                        `${v.text}:\`${v.count}\``
                )
                .join('\n')}\n------------------------------------\n<a:Star:632914440047820828> Звезды: \`${user!.Currency}\`\n<:box:632957783318462484> Контейнеры: \`${user!.packs}\`\n:cookie: Печеньки: \`${user!.cookies}\`${through != "" ? `\n<:topMoney:632970895496839198> Изображение:\`${through}\`` : ""}`);

        return message.channel.send(em);
    }
}

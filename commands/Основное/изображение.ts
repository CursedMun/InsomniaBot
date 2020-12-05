import { Command, Discord, Core } from "discore.js";
import Constants from "../../util/Constants";
import { withdrawTransaction, transferTransaction } from "../../Methods/allRelatedToCurrency";
import { unixTime } from "../../util/helpers";

export default class extends Command {
    get options() {
        return {
            permLevel: Constants.PermLevels.Demon,
        };
    }
    get customOptions() {
        return {
            group: "Основное",
            help: "Изменить изображение в своем профиле. Только ссылки, которые заканчиваются на .jpg|.gif|.png|.jpeg (прямые ссылки) Изображение ставится на 30 дней.",
            syntax: `${this.client.prefix}изображение [ссылка]`,
            example: `${this.client.prefix}изображение `,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { channel, member, mentions, guild } = message;
        const Users = this.client.db.getCollection("users")!;
        const unixes = this.client.db.getCollection("unixes")
        const target = mentions.members!.first() || guild!.members.cache.get(args[0]) || message.member;
        let user = await Users.getOne({ userId: target!.id });
        if (mentions.members?.first() && message.member?.hasPermission("ADMINISTRATOR")) {
            const notify = new Discord.MessageEmbed();
            notify.setColor(target!.displayColor);
            notify.setDescription(`Вы успешно удалили изображение ${mentions.members.first()}`)
            user.picture = null;
            await user.save().catch((e) => console.log(e));
            return channel.send(notify).catch(console.error);
        }
        if (!args[0] && user.picture != null) {
            const notify = new Discord.MessageEmbed();
            notify.setColor(target!.displayColor);
            notify.setDescription("Вы успешно удалили изображение из вашего профиля")
            await unixes?.deleteOne({ userId: member!.id, Type: 4 })
            user.picture = null;
            await user.save().catch((e) => console.log(e));
            return channel.send(notify).catch(console.error);
        } else {
            withdrawTransaction(member!, 5000, this.client, Constants.TransactionsTypes[13]).then(async result => {
                if (typeof (result) === "boolean" && !result) {
                    const embed1 = new Discord.MessageEmbed()
                        .setColor(member!.displayColor)
                        .setDescription(`${member}, у вас недостаточно звёзд!`);

                    return channel.send(embed1);
                } else {
                    user = await Users.getOne({ userId: member?.id });
                    const gif = args[0];
                    if (!gif) return;
                    if (!gif.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/gi)) return message.reply("неверная ссылка!");
                    const notify = new Discord.MessageEmbed();
                    notify.setColor(target!.displayColor);
                    notify.setDescription("Успех")
                    user.picture = gif;
                    const unix = await unixes?.getOne({ userId: member!.id, Type: 4 })
                    unix!.days = 30
                    unix!.time = unixTime() + 86400 * 30
                    await unix?.save().catch((e) => console.log(e));
                    await user.save().catch((e) => console.log(e));
                    return channel.send(notify).catch(console.error);
                }
            })

        }

    }
}

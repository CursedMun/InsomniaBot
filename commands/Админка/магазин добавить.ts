import { Command, Discord, Core, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { wholeNumber } from "../../util/functions";
export default class extends Command {
    get options() {
        return {
            permLevel: Constants.PermLevels.Administrator,
        };
    }
    get customOptions() {
        return {
            group: "Магазин",
            help: "Добавить прикольный лук в магазин",
            syntax: `${this.client.prefix}магазин добавить [@роль,название,ид] [цена] [дни(0- если навсегда)]`,
            example: `${this.client.prefix}магазин добавить @Куратор 100 1`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, member, mentions } = message;
        const shops = this.client.db.getCollection("shops")!;

        const price = wholeNumber(args[1]);
        if (!Number.isInteger(price)) return;
        const days = wholeNumber(args[2]);
        if (!Number.isInteger(days)) return;
        const role = days
            ? mentions.roles.first() ||
            guild!.roles.cache.get(args[0]) ||
            guild!.roles.cache.find((r) => r.name === args[0])
            : mentions.roles.first() ||
            guild!.roles.cache.get(args[0]) ||
            guild!.roles.cache.find((r) => r.name === args[0]);

        const item = await shops.getOne({ role: role!.id });
        // if(item)
        // return message.reply(
        //     new Discord.MessageEmbed()
        //         .setTitle("Ошибка")
        //         .setColor("RED")
        //         .setDescription(`${member}, данная роль уже есть в магазине!`)
        // );
        if (days)
            (item!.days = days)
        item!.role = role?.id;
        item!.price = price;
        await item!.save().catch(console.error)
        const notify = new Discord.MessageEmbed();

        notify
            .setDescription(
                `Роль ${role} добавлена/обновлен в магазин!\n**Цена**: ${price}${days ? `\n**Дни**: ${days}` : ""}`
            )
            .setColor("#ce2626");
        return channel.send(notify).catch(console.error);

    }
}

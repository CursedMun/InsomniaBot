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
            help: "Удалить лук из магазина",
            syntax: `${this.client.prefix}магазин удалить [ид(из магазина)]`,
            example: `${this.client.prefix}магазин удалить 1`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, member } = message;
        const shops = this.client.db.getCollection("shops")!;

        const id = wholeNumber(args[0]);
        if (!Number.isInteger(id)) return;
        let fetch = await shops.fetch();
        let items = fetch.sort((b, a) => a.price - b.price).array();
        let item = items[id - 1];
        if (!item)
            return message.reply(
                new Discord.MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription(
                        `${member}, товар с данным идентификатором не найден!`
                    )
            );

        let data = {
            _id: item._id,
        };
        await shops!.deleteOne(data)!.catch(console.error);

        const role = guild!.roles.cache.get(item.role);
        const notify = new Discord.MessageEmbed();

        notify
            .setDescription(
                `Роль ${role ? role : "Неизвестно"} удалена из магазина!`
            )
            .setColor("#ce2626");

        return channel.send(notify).catch(console.error);

    }
}

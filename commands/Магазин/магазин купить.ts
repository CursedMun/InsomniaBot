import { Command, Discord, Core, MongoCollection } from "discore.js";
import Constants from "../../util/Constants";
import { repeat, unixTime } from "../../util/helpers";
import { wholeNumber } from "../../util/functions";
import { withdrawTransaction } from "../../Methods/allRelatedToCurrency";
import moment from "moment";


export default class extends Command {
    get options() {
        return {};
    }
    get customOptions() {
        return {
            group: "Магазин",
            help: "Купить временную роль",
            syntax: `${this.client.prefix}магазин купить [номер]`,
            example: `${this.client.prefix}магазин купить 1`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, member, mentions } = message;
        const Unixes = this.client.db.getCollection("unixes")!;
        const Configs = this.client.db.getCollection("configs")!;
        const shops = this.client.db.getCollection("shops")!;
        const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });

        const id = parseInt(args[0]);
        if (!Number.isInteger(id)) return;
        let fetch = await shops.fetch();
        let items = fetch.sort((b, a) => b.price - a.price).array();
        let item = items[id - 1];
        if (!item)
            return message.reply(
                new Discord.MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription(`${member}, роль с данным номером не найдена!`)
            );

        const role = guild!.roles.cache.get(item.role);
        if (!role) return;

        if (member!.roles.cache.has(item.role))
            return message.reply(
                new Discord.MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription(`${member}, у вас уже имеется данная роль!`)
            );

        withdrawTransaction(member!, item.price, this.client, Constants.TransactionsTypes[3]).then(
            async (result: any) => {
                if (!result)
                    return channel.send(`${member}, у вас недостаточно звёзд!`);

                if (item.days && item.days !== 0) {
                    const unixestime = unixTime() + 86400 * item.days;
                    await Unixes.insertOne({
                        userId: member!.id,
                        time: unixestime,
                        days: item.days,
                        role: role.id,
                        Type: 2,
                    });
                }

                await member!.roles.add(role).catch(console.error);

                const notify = new Discord.MessageEmbed();

                notify
                    .setDescription(
                        `${member}, с вашего счёта списано **${item.price}**${
                        config!.CurrencyLogo
                        }!
                      Роль \`${role.name}\` успешно добавлена к вам в профиль.`
                    )
                    .setColor(member!.displayColor);

                return channel.send(notify);
            }
        );

    }
}

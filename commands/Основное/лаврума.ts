import { Command, Discord, Document } from "discore.js";
import Constants from "../../util/Constants";
import { removeExtraSpaces } from "../../util/functions";
import { withdrawTransaction } from "../../Methods/allRelatedToCurrency";

export default class extends Command {
    get options() {
        return {
        };
    }
    get customOptions() {
        return {
            group: "Основное",
            help: "Изменить название лаврумы",
            syntax: `${this.client.prefix}лаврума ИнсомнияПара`,
            example: `${this.client.prefix}лаврума ИнсомнияПара `,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { channel, member } = message;
        const Users = this.client.db.getCollection("users")
        const Voices = this.client.db.getCollection("voiceconfigs")!;
        const user = await Users?.findOne({ userId: member!.id });
        if (!user!.relationship) return message.reply("у вас нет пары")
        const voice = await Voices.getOne(((d: Document) => d.id == message.author.id && d.type == 1 || d.idScnd == message.author.id && d.type == 1));
        const notify = new Discord.MessageEmbed();
        notify.setColor(member!.displayColor);
        notify.setDescription("Успех")
        const msgArr = message.content.split(" ");
        const arg = removeExtraSpaces(msgArr.slice(1));
        const name = arg.join(" ");
        if (name.length > 12) return message.reply("Максимум 12").then(m => m.delete({ timeout: 5000 }));
        withdrawTransaction(member!, 2000, this.client, Constants.TransactionsTypes[13]).then(async result => {
            if (typeof (result) === "boolean" && !result) {
                const embed1 = new Discord.MessageEmbed()
                    .setColor(member!.displayColor)
                    .setDescription(`${member}, у вас недостаточно звёзд!`);

                return channel.send(embed1);
            } else {
                voice.voiceName = name
                voice.id = member!.id
                voice.idScnd = user!.relationship;
                voice.type = 1;
                await voice.save().catch((e) => console.log(e));
                return channel.send(notify).catch(console.error);
            }
        })

    }
}

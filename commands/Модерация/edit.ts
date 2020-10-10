import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
const messageRegex = /https:\/\/(?:canary\.)?discord(?:app)?\.com\/channels\/\d+\/(\d+)\/(\d+)/;
export default class extends Command {
    get options() {
        return {
            permLevel: Constants.PermLevels.Moderator,
            aliases: ["ред"]
        };
    }
    get customOptions() {
        return {
            group: "Модерация",
            help: "Редактировать ембед",
            syntax: `${this.client.prefix}edit [линк сообщение] [ембед](https://embedbuilder.nadekobot.me/)`,
            example: `${this.client.prefix}edit [линк сообщение] [ембед]`,
        };
    }

    async run(message: Discord.Message, [link, ...args]: string[]) {
        const match = link.match(messageRegex);
        if (!match) return;

        const channelID = match[1];
        const messageID = match[2];

        const channel = <Discord.TextChannel>(
            this.client.channels.cache.get(channelID)
        );
        if (!channel) return;
        if (channel.type !== 'text') return;

        const msg = await channel.messages.fetch(messageID).catch(() => { });
        if (!msg) return;

        try {
            const text = args.join(' ');
            const json = JSON.parse(text);

            if ({}.hasOwnProperty.call(json, 'thumbnail')) {
                json.thumbnail = { url: json.thumbnail };
            }
            if ({}.hasOwnProperty.call(json, 'image')) {
                json.image = { url: json.image };
            }

            const plainText = json.plainText || '';
            delete json.plainText;

            const embed = new Discord.MessageEmbed(json);

            msg.edit(plainText, embed).catch(() => { });
        } catch (_) { }
    }
}

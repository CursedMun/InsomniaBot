import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { inspect } from "util";

export default class extends Command {
    get options() {
        return {
            permLevel: Constants.PermLevels.Dev,
        };
    }
    get customOptions() {
        return {
            group: "Cursed",
            help: "test",
            syntax: `${this.client.prefix}teste`,
            example: `${this.client.prefix}test`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const clan = this.client.db.getCollection("clans")
        const clans = await clan?.fetch();
        clans?.forEach(async c => {
            const cc = await clan?.getOne({ ClubId: c.ClubId })
            cc?.save();
        })
    }
}

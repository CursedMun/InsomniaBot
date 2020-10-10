import { Command, Discord, Document } from "discore.js";
import { unix } from "moment-timezone";
import Constants from "../../util/Constants";
export default class extends Command {
  get options() {
    return {
      permLevel: Constants.PermLevels.Dev,
    };
  }
  get customOptions() {
    return {
      group: "Cursed",
      help: "релоад",
      syntax: `${this.client.prefix}релоад`,
      example: `${this.client.prefix}релоад`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const users = this.client.db.getCollection("users")
    const userss = await users?.filter((q: Document) => q.picture != null)
    userss?.forEach(async (u: Document) => {
      console.log(u._id)
      u.picture = null;
      u.Currency = u.Currency + 5000;
      await u.save()
    })
  }
}
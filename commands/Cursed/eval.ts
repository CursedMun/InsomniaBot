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
      help: "евал",
      syntax: `${this.client.prefix}евал`,
      example: `${this.client.prefix}евал`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    let evaled;
    const channel = message.guild?.channels.cache.get(
      Constants.Ids.dev.DevChannel
    ) as Discord.TextChannel;
    try {
      evaled = await eval(args.join(" "));
      //TODO Make it asynchronous
      let inspected = inspect(evaled);
      for (let i = 0; i < inspected.length; i += 1950) {
        const toSend = inspected.substring(
          i,
          Math.min(inspected.length, i + 1950)
        );

        channel.send(`\`\`\`${toSend}\`\`\``);
      }
    } catch (error) {
      console.error(error);
      message.reply("there was an error during evaluation.");
    }
  }
}

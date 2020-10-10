import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { awardTransaction } from "../../Methods/allRelatedToCurrency";

export default class extends Command {
  get options() {
    return {
      aliases: ["пик", "pick"],
    };
  }
  get customOptions() {
    return {
      global: true,
      group: "Экономика",
      help: "Подобрать упавшую валюту",
      syntax: `${this.client.prefix}пик/pick`,
      example: `${this.client.prefix}пик/pick`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const Drops = this.client.db.getCollection("drops")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    });
    const { channel, member } = message;

    const drop = await Drops.findOne({ channelID: message.channel.id });
    if (!drop) return;
    await Drops.deleteOne({ _id: drop!._id });
    let mostAmount = drop.value;
    if (mostAmount == 0) return await Drops.deleteOne({ _id: drop._id });
    await awardTransaction(member!, mostAmount, this.client).then(
      async (result) => {
        if (typeof result === "boolean" && !result) return;

        const notify = new Discord.MessageEmbed()
          .setColor(member!.displayColor)
          .setDescription(
            `${member} подобрал **${mostAmount}** падающих${
            config!.CurrencyLogo
            }`
          );

        return channel.send(notify);
      }
    );
  }
}

import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { randomInt, wholeNumber } from "../../util/functions";
import moment from "moment";

export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Экономика",
      help: "Открыть нужное количество имеющихся контейнеров",
      syntax: `${this.client.prefix}открыть [кол-во]`,
      example: `${this.client.prefix}открыть 100`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    });
    const { channel, member } = message;
    const data = {
      userId: member!.id,
    };
    let user = await Users.getOne(data);
    const amount = wholeNumber(Number(args[0]));
    let toOpen: number = Number(amount ? amount : 1);
    if (toOpen < 0) return;
    if (!Number.isInteger(toOpen) || !toOpen) return;
    
    if (Number(user.packs) < toOpen)
      return channel.send(
        new Discord.MessageEmbed()
          .setTitle("Ошибка")
          .setColor("RED")
          .setDescription(`${member}, у вас недостаточно контейнеров!`)
      );

    let desc = "";
    let tran = 0;
    let total = 0;
    for (let i = 0; i < toOpen; i++) {
      const rndCurrency = randomInt(30, 100);
      total += rndCurrency;
    }
    desc += `**${total}** ${config!.CurrencyLogo}`;
    tran += total;
    user.packs = Number(user.packs - toOpen);
    user.Currency = Number(user.Currency + tran);
    let timely =
      user.packs == 0
        ? `Осталось: ${user.packs} контейнеров`
        : user.packs == 1
          ? `Осталось: ${user.packs} контейнер`
          : user.packs > 1 && user.packs < 5
            ? `Осталось: ${user.packs} контейнера`
            : `Осталось: ${user.packs} контейнеров`;
    const notify = new Discord.MessageEmbed()
      .setColor(member!.displayColor)
      .setAuthor(
        `${member!.user.tag}`,
        `${member!.user.displayAvatarURL({ dynamic: true, size: 2048 })}`
      );
    if (toOpen == 1) {
      notify.setTitle(`${toOpen} контейнер открыт🔓`);
    } else if (toOpen > 1 && toOpen < 5) {
      notify.setTitle(`${toOpen} контейнера открыто🔓`);
    } else {
      notify.setTitle(`${toOpen} контейнеров открыто🔓`);
    }
    notify.setFooter(timely).setThumbnail(`https://i.imgur.com/j587GtP.gif`);
    notify.setDescription(`Вам выпало ${desc}`);
    await user.save().catch()
    return channel.send(notify)
  }
}

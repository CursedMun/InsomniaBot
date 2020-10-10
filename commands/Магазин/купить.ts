import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { withdrawTransaction } from "../../Methods/allRelatedToCurrency";
const roles = {
  3: {
    name: "role3d",
    days: 3,
  },
  7: {
    name: "role7d",
    days: 7,
  },
  10: {
    name: "role10d",
    days: 10,
  },
  20: {
    name: "role20d",
    days: 20,
  },
  30: {
    name: "role30d",
    days: 30,
  },
};
export default class extends Command {
  get options() {
    return {};
  }
  get customOptions() {
    return {
      group: "Магазин",
      help: "Купить личную роль",
      syntax: `${this.client.prefix}купить [номер]`,
      example: `${this.client.prefix}купить 1`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const Users = this.client.db.getCollection("users")!;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    const tempRoles = this.client.db.getCollection("temproles")!;
    const { member, guild, channel } = message;
    let fetch = await tempRoles.fetch();
    let items = fetch.sort((a, b) => a.price - b.price).array();
    let item = items[Number(args[0]) - 1];
    if (!item)
      return message.reply(
        new Discord.MessageEmbed()
          .setTitle("Ошибка")
          .setColor("RED")
          .setDescription(`${member}, роль с данным номером не найдена!`)
      );

    withdrawTransaction(member!, item.price, this.client, Constants.TransactionsTypes[2]).then(
      async (result) => {
        if (typeof result === "boolean" && !result) {
          const embed1 = new Discord.MessageEmbed()
            .setColor(member!.displayColor)
            .setDescription(`${member}, у вас недостаточно звёзд!`);

          return channel.send(embed1);
        } else {
          const user = await Users.findOne({ userId: member?.id });
          const number: number = item.timeDays
          if (number != 3 && number != 7 && number != 10 && number != 20 && number != 30) return
          const invItem = user!.inventory[roles[number].name];
          invItem.count = invItem.count + 1;
          await user!.save().catch((err) => console.log(err));
          const notify = new Discord.MessageEmbed();

          notify
            .setDescription(
              `${member}, с вашего счёта списано **${item.price}**${
              config!.CurrencyLogo
              }!
                                            Роль \`${
              invItem.text
              }\` успешно добавлена в профиль.
              ${this.client.prefix}личнаяроль [дни] [[цвет-код](https://html-color-codes.info/Cvetovye-kody-HTML/)] [название] [[эмоджи](https://getemoji.com/)]`
            )
            .setColor(member!.displayColor)
          return channel.send(notify);
        }
      }
    );
  }
}

import { Command, Discord } from "discore.js";
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
      group: "Админка",
      help: "Изменить основные значения на сервере. Использовать только после согласования с Совой",
      syntax: `${this.client.prefix}конфиг`,
      example: `${this.client.prefix}конфиг`,
    };
  }

  async run(message: Discord.Message, args: string[]) {
    const { channel, member, guild } = message;
    const Configs = this.client.db.getCollection("configs")!;
    const config = await Configs.getOne({
      guildId: Constants.Ids.guilds[0],
    });
    const data = {
      guildId: guild!.id,
    };
    let color = "F8E71C";
    const selected = args[0];
    if (!selected) {
      const notify = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`**Список конфигураций**`)
        .setDescription(`
            \`currencyLogo\` - иконка валюты\n
            \`daily\` - [время в часах] [кол-во волюты]\n`
        )
        .setFooter(
          `Используйте команду !конфиг (параметр конфигурации) (новое значение)`
        );

      return channel.send(notify);
    } else if ("currencyLogo".includes(selected)) {
      const CurrencyLogo = args[1];
      if (!CurrencyLogo) return;
      config!.CurrencyLogo = CurrencyLogo;

      await config!.save().catch();

      const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setDescription(`Установлена новая иконка валюты - ${args[1]}`);

      return channel.send(embed);
    } else if ("daily".includes(selected)) {
      const DailyTime = wholeNumber(3600 * Number(args[1]));
      if (!Number.isInteger(DailyTime)) return;

      const DailyCount = wholeNumber(Number(args[2]));
      if (!Number.isInteger(DailyCount)) return;
      config!.DailyTime = DailyTime;
      config!.DailyCount = DailyCount;

      await config!.save().catch();

      const embed = new Discord.MessageEmbed().setColor(color)
        .setDescription(`Установлены новые параметры для **Daily**
            Использование команды каждые \`${args[1]}\` часов
            Вознаграждение \`${DailyCount}\` валюты`);

      return channel.send(embed);
    } else return;
  }
}

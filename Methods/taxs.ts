import { Discord, Core, Document } from "discore.js";
import * as helper from "../util/helpers";
import Constants from "../util/Constants";
import { withdrawTaxs, withdrawLoveTaxs } from "./allRelatedToCurrency";

export async function clantaxs(guild: Discord.Guild, Core: Core) {
  const Users = Core.db.getCollection("users")!;
  const unix = Core.db.getCollection("clantaxs")!;
  const clans = Core.db.getCollection("clans")!;
  const Config = await Core.db
    .getCollection("configs")
    ?.getOne({ guildId: Constants.Ids.guilds[0] });
  const u = await unix.fetch();
  if (!u.size) return;
  u.forEach(async (q) => {
    const ClubId = q.ClubId;
    const data = {
      ClubId: ClubId,
    };

    const times = helper.unixTime();
    const timeout = q.time > 0 && times >= q.time && q.stage == 0;
    const timeout1 = q.time > 0 && times >= q.time && q.stage == 1;
    const timeout2 = q.time > 0 && times >= q.time && q.stage == 2;

    const tax = 2500;

    const clan = await clans.findOne(data);
    const role = guild.roles.cache.get(clan!.clanRole);
    const channel = guild.channels.cache.get(
      clan!.clanChat
    ) as Discord.TextChannel;
    const voice = guild.channels.cache.get(Constants.Ids.Chs.Clan.channel);

    if (timeout) {
      const unixestime = times + 86400 * 6;
      q.stage = 1;
      q.time = unixestime;
      await q.save().catch(console.error);

      const embed = new Discord.MessageEmbed()
        .setColor("#ce2626")
        .setTitle("INsomnia\\💤 уведомляет")
        .setDescription(
          `**Через 7 дней** с капитала **спишется налог**, за неуплату которого ваше сообщество будет распущено!`
        )
        .setFooter(
          `Используйте команду - "!сб пополнить [сумма]", чтобы пополнить капитал сообщества.`
        );

      return channel.send(embed);
    } else if (timeout1) {
      const unixestime = times + 86400 * 1;
      q.stage = 2;
      q.time = unixestime;
      await q.save().catch(console.error);

      const embed = new Discord.MessageEmbed()
        .setColor("#ce2626")
        .setTitle("INsomnia\\💤 уведомляет")
        .setDescription(
          `Уже **завтра** с капитала будет списано **${tax}**${Config!.CurrencyLogo
          }.\nПоследний день, чтобы подкопить звёзды. Иначе ваше сообщество будет распущено!`
        )
        .setFooter(
          `Используйте команду - "!сб пополнить [сумма]", чтобы пополнить капитал сообщества.`
        );

      return channel.send(embed);
    } else if (timeout2) {
      withdrawTaxs(ClubId, tax, Core).then(async (result) => {
        if (typeof result === "boolean" && !result) {
          const embed1 = new Discord.MessageEmbed()
            .setColor("#ce2626")
            .setTitle(`INsomnia\\💤 уведомляет`)
            .setDescription(`Клан удалили. Упс...`)
            .setFooter(`Упс...`)
            .setThumbnail(`https://media1.giphy.com/media/3Z1frUjlKRIqJhnhAW/source.gif`);
          channel.send(embed1);
          await role!.delete();
          await Users.updateOne({ id: clan!.owner }, { isClubOwner: 0 });
          const smth = await Users.filter(
            (value: any) => (value.ClubId == ClubId)
          );

          smth.forEach(async (m: Document) => {
            m.ClubId = null;
            await m.save().catch(console.error);
          });
          await clans.deleteOne(data)?.catch(console.error);
          await unix.deleteOne({ ClubId, stage: 2 });

        } else {
          const unixestime = times + 2505600 * 1;
          q.stage = 0;
          q.time = unixestime;
          await q.save().catch(console.error);
          const embed2 = new Discord.MessageEmbed()
            .setColor(role!.color)
            .setDescription(
              `Налог успешно оплачен \nВаше сообщество может спать спокойно еще 30 дней 😌`
            )
            .setFooter(
              `Используйте команду - "!сб пополнить [сумма]", чтобы пополнить капитал сообщества.`
            );

          return channel.send(embed2);
        }
      });
    }
  });
}
export async function LoveTaxs(guild: Discord.Guild, Core: Core) {
  const Users = Core.db.getCollection("users")!;
  const unix = Core.db.getCollection("LoveTaxs")!;
  const Configs = Core.db.getCollection("configs")!;
  let u = await unix.fetch();
  if (!u.size) return;
  u.forEach(async (q) => {
    const idone = q.idone;
    const idscnd = q.idscnd;
    const config = await Configs.getOne({ guildId: Constants.Ids.guilds[0] });
    const times = helper.unixTime();
    const timeout = q.time > 0 && times >= q.time && q.stage == 0;
    const timeout1 = q.time > 0 && times >= q.time && q.stage == 1;
    const timeout2 = q.time > 0 && times >= q.time && q.stage == 2;

    const tax = 200;
    const first = guild.members.cache.get(idone)!;
    const scnd = guild.members.cache.get(idscnd)!;
    try {
      if (timeout) {
        const unixestime = times + 86400 * 6;
        q.stage = 1;
        q.time = unixestime;
        await q.save().catch(console.error);
        const embed = new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setTitle("INsomnia\\💤 уведомляет")
          .setDescription(
            `**Через 7 дней** с вас спишется **200** звёзд.\nЕсли не накопите данную сумму, пара будет распущена!`
          )
          .setFooter(
            `Используйте команду - "!$", чтобы проверить свой баланс.`
          );
        await first.send(embed);
        return scnd.send(embed);
      } else if (timeout1) {
        const unixestime = times + 86400 * 1;
        q.stage = 2;
        q.time = unixestime;
        q.save().catch();
        const embed1 = new Discord.MessageEmbed()
          .setColor("#ce2626")
          .setTitle("Продление пары")
          .setDescription(
            `Уже **завтра** с вас будет списано **200**${config!.CurrencyLogo
            }.\nПоследний день, чтобы подкопить звёзды. Иначе ваша пара будет распущена!`
          )
          .setFooter(
            `Используйте команду - "!$", чтобы проверить свой баланс.`
          );

        first!.send(embed1);
        return scnd!.send(embed1);
      } else if (timeout2) {
        withdrawLoveTaxs(first, scnd, tax, Core).then(async (result) => {
          if (typeof result === "boolean" && !result) {
            const embed8 = new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setDescription(
                `Вам не хватило звёзд для продления! Пара распущена.`
              );

            const firstusr = await Users.getOne({ userId: idone.id });
            const scndusr = await Users.getOne({ userId: scnd.id });
            firstusr.relationship = null;
            firstusr.relationshipRoleID = null;
            scndusr.relationship = null;
            scndusr.relationshipRoleID = null;
            await firstusr.save().catch(console.error);
            await scndusr.save().catch(console.error);
            await unix.deleteOne({ _id: q._id });
            scndusr.roles.remove(Constants.Ids.Roles.Users.LoveRole)
            firstusr.roles.remove(Constants.Ids.Roles.Users.LoveRole)
            first.send(embed8);
            return scnd.send(embed8);
          } else {
            const unixestime = times + 86400 * 30;
            q.time = unixestime;
            q.stage = 0;
            await q.save().catch(console.error);
            const embed2 = new Discord.MessageEmbed()
              .setColor("#ce2626")
              .setTitle("Пара успешно продлена.")
              .setDescription(`Следующая плата будет списана через 30 дней 😌`)
              .setFooter(
                `Используйте команду - "!$", чтобы проверить свой баланс.`
              );

            first!.send(embed2);
            return scnd!.send(embed2);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
}

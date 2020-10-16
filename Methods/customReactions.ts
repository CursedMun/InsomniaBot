import { Discord, Core } from "discore.js";
import Constants from "../util/Constants";
import * as funcs from "../util/functions"
import { withdrawTransaction } from "./allRelatedToCurrency";
export async function customreactions(
  core: Core,
  message: Discord.Message,
  args: string[],
  cmd: any
) {
  const { guild, channel, mentions, member } = message;
  if (
    message.member?.hasPermission("ADMINISTRATOR") ||
    [Constants.Ids.Roles.Users.Sponsor,
      Constants.Ids.Roles.Users.Novolunie,
      Constants.Ids.Roles.Users.Demon,
      Constants.Ids.Roles.Users.ServerBooster].some(r => message.member?.roles.cache.has(r)) ||
    channel.id == Constants.Ids.Chs.ServerChats.FloodChat ||
    (await core.db.getCollection("clans")?.findOne({ clanChat: channel.id }))
  ) {
    let name = await core.db.getCollection("customreactions")?.fetch()!;
    if (!name.size) return;

    name.forEach(async (cm) => {
      if (cmd === cm.name) {
        const data = {
          name: cm.name,
        };

        const config = await core.db
          .getCollection("configs")
          ?.findOne({ guildId: guild!.id });
        const text = cm.embed;

        const img = await core.db.getCollection("reactgifs")?.findOne(data);
        const imag = img!.gifUrl;
        if (!imag)
          return funcs.sendError(
            channel as Discord.TextChannel,
            `${member}, для работы реакции требуется добавить гифку!`
          ).catch(console.error);
        const result = imag.split(",");
        const rndImage = Math.floor(Math.random() * result.length);

        const image = result[rndImage];


        let user = await core.db.getCollection("users")?.findOne({ userId: member!.id });

        const balance = user!.Currency;

        if (balance < Number(cm.price))
          return funcs.sendError(
            channel as Discord.TextChannel,
            `${member}, недостаточно средств!`
          ).catch(console.error);

        const target = mentions.members?.first() || guild?.members.cache.get(args[1]);
        try {
          if (text.search("%target%") != -1) {
            if (!target) return;
            if (target.id === member?.id) return;

            withdrawTransaction(member!, cm.price, core, Constants.TransactionsTypes[11]);

            const one = text.replace(/%target%/g, target.toString());
            const two = one.replace(/%member%/g, member?.toString());
            const three = two.replace(
              /%avatar%/g,
              member!.user.displayAvatarURL({ dynamic: true, size: 2048 })
            );
            const four = three.replace(/%user.tag%/g, member?.displayName);
            const five = four.replace(
              /%price%/g,
              `${cm.price}${config!.CurrencyLogo}`
            );

            const embed = JSON.parse(five);

            if (image && !image.url) embed.image = { url: image };
            return channel.send({ embed }).catch(console.error);
          } else {
            //if (target) return;

            withdrawTransaction(member!, cm.price, core, Constants.TransactionsTypes[11]);

            const two = text.replace(/%member%/g, member?.toString());
            const three = two.replace(
              /%avatar%/g,
              member?.user.displayAvatarURL({ dynamic: true, size: 2048 })
            );
            const four = three.replace(/%user.tag%/g, member?.displayName);
            const five = four.replace(
              /%price%/g,
              `${cm.price}${config!.CurrencyLogo}`
            );

            const embed = JSON.parse(five);

            if (image && !image.url) embed.image = { url: image };
            return channel.send({ embed }).catch(console.error);
          }
        } catch (e) {
          console.log(e);
          return channel
            .send(`Произошла ошибка!`)
            .then((msgs) => {
              msgs.delete({ timeout: 5000 });
            })
            .catch(console.error);
        }
      }
    });
  }
}

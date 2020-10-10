import { Discord, Core } from "discore.js";
import Constants from "../util/Constants";
import { unixTime } from "../util/helpers";
import { withdrawTransaction } from "./allRelatedToCurrency";
import messageEvents from "../events/messageEvents";
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
//Type 0: shop role
//Type 1: self role
//Type 2: gived role
//Type 3: color role
//Type 4: profile image
export async function verifyTimeRoles(guild: Discord.Guild, core: Core) {
  const Users = core.db.getCollection("users")!;
  const unix = core.db.getCollection("unixes")!;
  //const Configs = core.db.getCollection("configs")!;
  let u = await unix.fetch();
  if (!u.size) return;
  u.forEach(async (q) => {
    const member = guild.members.cache.get(q.userId);

    if (member) {
      const times = unixTime();
      const timeout = q.time > 0 && times >= q.time;

      try {
        const roleattime = guild.roles.cache.get(q.role);

        if (timeout && roleattime) {
          q.time = 0;
          q.save().catch(console.error);
          if (q.Type == 0) {
            const notify = new Discord.MessageEmbed()
              .setColor(roleattime.color)
              .setDescription(
                `Срок купленной роли \`${roleattime.name}\` истёк!`
              )
              .setFooter(
                `Используйте команду - "!магазин", чтобы выбрать себе новую роль.`
              );
            await unix.deleteOne({ _id: q._id });
            member.roles.remove(roleattime);
            return member.send(notify).catch(err => console.error(`Не смог отправить смс в лс ${member.user.tag}`));;
          } else if (q.Type == 1) {
            const notify = new Discord.MessageEmbed()
              .setColor(roleattime.color)
              .setDescription(
                `Срок вашей личной роли \`${roleattime.name}\` истёк!\n продлить ещё на ${q.days} ?`
              )
              .setFooter(
                `Подкопите звёзд и используйте команду - "!личнаяроль [дни] [цвет] [название] [эмоджи]".`
              );
            member!.send(notify).then(async (m) => {
              await m.react(`633712359772389386`);
              await m.react(`633712357129977876`);

              const filter = (
                react: Discord.MessageReaction,
                user: Discord.GuildMember
              ) =>
                (react.emoji.id == "633712359772389386" ||
                  react.emoji.id == "633712357129977876") &&
                user.id == member!.id;
              const collector = m.createReactionCollector(filter, {
                time: 60000 * 180,
              });

              m.delete({ timeout: 60000 * 180 }).then(async (message) => {
                if (!message) return;
                const embed2 = new Discord.MessageEmbed()
                  .setColor(roleattime!.color)
                  .setDescription(`Роль удалена`);
                await unix.deleteOne({ _id: q._id });
                await roleattime.delete();
                return member!.send(embed2);
              });

              collector.on("collect", async (reaction) => {
                if (reaction.emoji.id == "633712359772389386") {
                  const user = await Users.findOne({ userId: member.id })
                  const tempshops = core.db.getCollection("temproles")
                  const days: number = q.days
                  if (days != 3 && days != 7 && days != 10 && days != 20 && days != 30) return
                  const shops = await tempshops?.findOne({ timeDays: days })
                  let invItem = user!.inventory[roles[days].name];
                  if (invItem.count > 0) {
                    invItem.count = invItem.count - 1;
                    q.time = unixTime() + 86400 * days;
                    const embed = new Discord.MessageEmbed()
                      .setColor(roleattime!.color)
                      .setDescription(`Успех`);
                    reaction.message.delete()
                    await user?.save().catch(console.error)
                    await q.save().catch(console.error);
                    return member!.send(embed);
                  } else {
                    withdrawTransaction(member!, shops!.price, core, Constants.TransactionsTypes[12]).then(async (result) => {
                      if (typeof result === "boolean" && !result) {
                        await unix.deleteOne({
                          userId: q.userId,
                          time: 0,
                        });
                        reaction.message.delete()
                        await roleattime.delete();
                        return member.send(new Discord.MessageEmbed().setDescription(`У вас недостаточно звёзд`)
                        ).catch(err => console.error(`Не смог отправить смс в лс ${member.user.tag}`));;
                      } else {
                        q.time = unixTime() + 86400 * q.days;
                        const embed = new Discord.MessageEmbed()
                          .setColor(roleattime!.color)
                          .setDescription(`Успех`);
                        reaction.message.delete()
                        await q.save().catch(console.error);
                        return member!.send(embed);
                      }
                    })
                  }
                  return
                } else if (reaction.emoji.id == "633712357129977876") {
                  reaction.message.delete()
                  await unix.deleteOne({
                    userId: q.userId,
                    time: 0,
                  });
                  return await roleattime.delete();
                }
              });
            });
          } else if (q.Type == 2) {
            member.roles.remove(roleattime);
            const notify = new Discord.MessageEmbed()
              .setColor(roleattime.color)
              .setDescription(
                `Срок выданной вам роли \`${roleattime.name}\` истёк!`
              )
              .setFooter(
                `Чтобы вам выдали её снова, обратитесь к администрации!`
              );
            await unix.deleteOne({ _id: q._id });
            return member.send(notify).catch(err => console.error(`Не смог отправить смс в лс ${member.user.tag}`));;
          } else if (q.Type == 3) {
            roleattime.delete();
            const notify = new Discord.MessageEmbed()
              .setColor(roleattime.color)
              .setDescription(
                `Срок выданной вам цветной роли \`${roleattime.name}\` истёк!`
              )
              .setFooter(
                `Забустив сервер, у вас на целый месяц появится возможность менять себе цвет!`
              );

            return member.send(notify).catch(err => console.error(`Не смог отправить смс в лс ${member.user.tag}`));;
          }
          else {
            await unix.deleteOne({ _id: q._id });
          }
        }

        if (q.Type == 4 && timeout) {
          const user = await Users.findOne({ userId: member.id })
          user!.picture = null;
          const notify = new Discord.MessageEmbed()
            .setDescription(
              `Срок вашей картинки закончился`
            )
          await user!.save();
          await unix.deleteOne({ _id: q._id});
          return member.send(notify).catch(err => console.error(`Не смог отправить смс в лс ${member.user.tag}`));
        }
        if (timeout) {
          await unix.deleteOne({ _id: q._id });
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}

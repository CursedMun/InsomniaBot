import { Command, Discord } from "discore.js";
import Constants from "../../util/Constants";
import { unixTime } from "../../util/helpers";

export default class extends Command {
    get options() {
        return {
            permLevel: Constants.PermLevels.Administrator,
        };
    }
    get customOptions() {
        return {
            group: "Админка",
            help: "Проверить все устарелые роли",
            syntax: `${this.client.prefix}проверкаРолей`,
            example: `${this.client.prefix}проверкаРолей`,
        };
    }

    async run(message: Discord.Message, args: string[]) {
        const { guild, channel, mentions, member } = message;
        const unixes = this.client.db.getCollection("unixes")
        const users = this.client.db.getCollection("users")
        const notify = new Discord.MessageEmbed()
        const unUsedRoles = guild?.roles.cache.filter(r => r.name == "INsomniaColor" && r.members.size < 1 || r.name == "INcolor" && r.members.size < 1)
        const roles = await unixes!.fetch();
        try {
            
        } catch (error) {
            
        }
        roles.forEach(async r => {
            if (r.time == 0 || unixTime() >= r.time) {
                if (r.Type == 4) {
                    const user = await users?.findOne({ userId: r.userId })
                    user!.gif = null;
                    await user!.save()
                    unixes?.deleteOne({ _id: r._id })
                    channel.send(new Discord.MessageEmbed().setColor(member!.displayColor).setAuthor(member?.displayName, member?.user.displayAvatarURL({ dynamic: true })).setDescription(`Ещё у ${r.userId} закончилась картинка`))
                } else {
                    console.log(r)
                    const roleToDelete = guild?.roles.cache.get(r.role)
                    if (r.Type == 3 || r.Type == 1) {
                        await roleToDelete?.delete()
                    } else if (r.Type == 2 || r.Type == 0) {
                        await guild?.members.cache.get(r.userId)?.roles.remove(r.role)
                    }

                    notify
                        .setColor(member!.displayColor)
                        .setAuthor(
                            member!.displayName,
                            member!.user.displayAvatarURL({ dynamic: true })
                        )
                        .setDescription(
                            `${r.role} была ${r.Type == 0 ? "снята" : "удалена"} принадлежала <@${r.userId}>`
                        );

                    await unixes?.deleteOne({ _id: r._id })

                    channel.send(notify)
                }

            }
        })
        unUsedRoles?.forEach(async (r) => {
            const role = await unixes?.findOne({ role: r.id })
            notify
                .setColor(member!.displayColor)
                .setAuthor(
                    member!.displayName,
                    member!.user.displayAvatarURL({ dynamic: true })
                )
                .setDescription(
                    `${r.id} была удалена ${role ? `Ещё я её нашёл в базе данных у ${role.userId} и тоже удалил` : ""}`
                );
            await r.delete();

            channel.send(notify)
        })
        const oldRoles = guild?.roles.cache.filter(r => r.name == "INcolor")
        oldRoles?.forEach(r => {
            r.members.forEach(async m => {
                if (!m.roles.cache.has(Constants.Ids.Roles.Users.ServerBooster) && !m.roles.cache.has(Constants.Ids.Roles.Staff.eventCreator)) {
                    await r.delete();
                    notify
                        .setColor(member!.displayColor)
                        .setAuthor(
                            member!.displayName,
                            member!.user.displayAvatarURL({ dynamic: true })
                        )
                        .setDescription(
                            `Ещё я заметил что у ${m} нет <@&587700536468308006> или <@&530475930695499796> и снял у него роль ${r.id}`
                        );
                    channel.send(notify)
                }
            })
        })
        return await message.react("633712359772389386");
    }
}

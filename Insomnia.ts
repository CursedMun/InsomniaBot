import { Core, PermissionLevels, Mongo, Discord, Json } from "discore.js";

import { existsSync, readFileSync } from "fs";
import Constants, { Colors } from "./util/Constants";
import { CronJob } from "cron";
import * as helpers from "./util/helpers";
import { updateOnline } from "./Methods/allRelatedtoEXP";
import { clantaxs, LoveTaxs } from "./Methods/taxs";
import { verifyTimeRoles } from "./Methods/verifyTimeRoles";
import { EventEmitter } from "events";
import { checkAllRooms } from "./util/functions";
import { updateBotPresence } from "./util/helpers";
if (existsSync("./.env")) {
  readFileSync("./.env", "utf8")
    .toString()
    .split(/\n|\r|\r\n/)
    .forEach((e) => {
      const keyValueArr = e.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (keyValueArr != null) {
        process.env[keyValueArr[1]] = keyValueArr[2];
      }
    });
}
const db = new Mongo(String(process.env.mongodb), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//#region addModels to db
EventEmitter.defaultMaxListeners = 19;
db.addModel("creatorspost", {
  messageID: Mongo.Types.String,
  date: Mongo.Types.Date,
  userId: Mongo.Types.String,
  content: Mongo.Types.String,
  used: {
    type: Mongo.Types.Boolean,
    default: false,
  },
})
db.addModel("configs", {
  guildId: Mongo.Types.String,
  xpOnline: {
    type: Mongo.Types.Number,
    default: 60,
  },
  xpMessage: {
    type: Mongo.Types.Number,
    default: 15,
  },
  prefix: {
    type: Mongo.Types.String,
    default: "!",
  },
  CurrencyLogo: {
    type: Mongo.Types.String,
    default: "<a:Star:632914440047820828>",
  },
  DailyCount: {
    type: Mongo.Types.Number,
    default: 10,
  },
  DailyTime: {
    type: Mongo.Types.Number,
    default: 86400,
  },
  ItemsOnPage: {
    type: Mongo.Types.Number,
    default: 5,
  },
  Messages: {
    type: Mongo.Types.Number,
    default: 0,
  },
});
db.addModel("users", {
  userId: Mongo.Types.String,
  status: {
    type: Mongo.Types.String,
    default: null,
  },
  online: {
    type: Mongo.Types.Number,
    default: 0,
  },
  ClubId: {
    type: Mongo.Types.String,
    default: null,
  },
  isClubOwner: {
    type: Mongo.Types.Number,
    default: 0,
  },
  lvl: {
    type: Mongo.Types.Number,
    default: 0,
  },
  xp: {
    type: Mongo.Types.Number,
    default: 0,
  },
  MessageXp: {
    type: Mongo.Types.Number,
    default: 0,
  },
  ExperienceOnline: {
    type: Mongo.Types.Number,
    default: 0,
  },
  PacksOnline: {
    type: Mongo.Types.Number,
    default: 0,
  },
  CurrencyOnline: {
    type: Mongo.Types.Number,
    default: 0,
  },
  Currency: {
    type: Mongo.Types.Number,
    default: 0,
  },
  packs: {
    type: Mongo.Types.Number,
    default: 0,
  },
  lastDaily: {
    type: Mongo.Types.Number,
    default: 0,
  },
  msgCount: {
    type: Mongo.Types.Number,
    default: 0,
  },
  relationship: {
    type: Mongo.Types.String,
    default: null,
  },
  relationshipRoleID: {
    type: Mongo.Types.String,
    default: null,
  },
  cookies: {
    type: Mongo.Types.Number,
    default: 0,
  },
  picture: Mongo.Types.String,
  inventory: {
    type: Mongo.Types.Object,
    default: {
      role3d: {
        count: 0,
        emoji: "",
        name: "",
        text: "Личная роль на 3 дня",
      },
      role7d: {
        count: 0,
        emoji: "",
        name: "",
        text: "Личная роль на 7 дней",
      },
      role10d: {
        count: 0,
        emoji: "",
        name: "",
        text: "Личная роль на 10 дней",
      },
      role20d: {
        count: 0,
        emoji: "",
        name: "",
        text: "Личная роль на 20 дней",
      },
      role30d: {
        count: 0,
        emoji: "",
        name: "",
        text: "Личная роль на 30 дней",
      },
    },
  },
});
db.addModel("clans", {
  status: {
    type: Mongo.Types.String,
    default: "OPEN",
  },
  name: Mongo.Types.String,
  owner: {
    type: Mongo.Types.String,
    default: null,
  },
  ClubId: {
    type: Mongo.Types.String,
    default: null,
  },
  balance: {
    type: Mongo.Types.Number,
    default: 0,
  },
  clanRole: {
    type: Mongo.Types.String,
    default: null,
  },
  clanChat: {
    type: Mongo.Types.String,
    default: null,
  },
  DateCreated: {
    type: Mongo.Types.String,
    default: "null",
  },
  gifURL: {
    type: Mongo.Types.String,
    default: null,
  },
  level: {
    type: Mongo.Types.Number,
    default: 1,
  },
  slots: {
    type: Mongo.Types.Number,
    default: 15,
  },
  taxs: {
    type: Mongo.Types.Object,
    default: {
      time: helpers.unixTime() + 2505600,
      stage: 0
    }
  }
  ,
});
db.addModel("cookiesystem", {
  userID: Mongo.Types.String,
  targetID: Mongo.Types.String,
  timeout: Mongo.Types.Number,
});
db.addModel("customreactions", {
  name: Mongo.Types.String,
  embed: Mongo.Types.String,
  price: Mongo.Types.Number,
});
db.addModel("drops", {
  channelID: Mongo.Types.String,
  value: Mongo.Types.Number,
});
db.addModel("discordemojis", {
  channelid: Mongo.Types.Number,
  emojiid: Mongo.Types.Number,
  value: Mongo.Types.String,
  price: Mongo.Types.Number,
});
db.addModel("LoveTaxs", {
  idone: Mongo.Types.String,
  idscnd: Mongo.Types.String,
  time: Mongo.Types.Number,
  stage: {
    type: Mongo.Types.Number,
    default: 0,
  },
});
db.addModel("reactgifs", {
  name: Mongo.Types.String,
  gifUrl: Mongo.Types.String,
});
db.addModel("shops", {
  role: Mongo.Types.String,
  price: Mongo.Types.Number,
  days: Mongo.Types.Number,
});
db.addModel("temproles", {
  roleID: Mongo.Types.String,
  price: Mongo.Types.Number,
  timeDays: Mongo.Types.Number,
});
db.addModel("unixes", {
  userId: Mongo.Types.String,
  role: Mongo.Types.String,
  time: Mongo.Types.Number,
  days: {
    type: Mongo.Types.Number,
    default: null,
  },
  ClubId: {
    type: Mongo.Types.String,
    default: null,
  },
  //Type 0: shop role
  //Type 1: self role
  //Type 2: gived role
  //Type 3: color role
  //Type 4: profile image
  Type: {
    type: Mongo.Types.Number,
    default: 0,
  },
});
db.addModel("userclubdeposits", {
  userId: Mongo.Types.String,
  ClubId: Mongo.Types.String,
  totalDeposit: {
    type: Mongo.Types.Number,
    default: 0,
  },
});
db.addModel("voiceconfigs", {
  id: Mongo.Types.String,
  idScnd: Mongo.Types.String,
  voiceLimit: Mongo.Types.Number,
  voiceName: Mongo.Types.String,
  type: {
    type: Mongo.Types.Number,
    default: 0
  }
});
//#endregion

const staffRoles = Constants.Ids.Roles.Staff;
const serverRoles = Constants.Ids.Roles.Users
const permLevels = new PermissionLevels()
  .add(
    Constants.PermLevels.Dev,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(staffRoles.dev)
  )
  .add(
    Constants.PermLevels.Administrator,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(staffRoles.administrator)
  )
  .add(
    Constants.PermLevels.Moderator,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(staffRoles.moderator)
  )
  .add(
    Constants.PermLevels.Curator,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(staffRoles.curator)
  )
  .add(
    Constants.PermLevels.EventCreator,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(staffRoles.eventCreator)
  )
  .add(
    Constants.PermLevels.NitroBooster,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(serverRoles.ServerBooster)
  )
  .add(
    Constants.PermLevels.Donater,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(serverRoles.Sponsor)
  )
  .add(
    Constants.PermLevels.Demon,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(serverRoles.Demon)
  ).add(
    Constants.PermLevels.Novolunie,
    false,
    (msg: Discord.Message) =>
      msg.member && msg.member.roles.cache.has(serverRoles.Novolunie)
  );;
const core = new Core({
  commandOptions: {
    argsSeparator: " ",
    ignoreBots: true,
    ignoreCase: true,
    ignoreSelf: true,
    permLevels,
  },
  prefixOptions: {
    ignoreCase: true,
    mention: false,
    spaceSeparator: true,
  },
  folders: {
    commands: "commands",
    events: "events",
    inhibitors: "inhibitors",
  },
  prefix: "!",
  token: process.env.CLIENT_TOKEN,
  db,
})
  .once("ready", () => {
    console.log(`БОТ ЗАПУЩЕН!`);
    const guild = core.guilds.cache.get(Constants.Ids.guilds[0])!;
    const channel = guild.channels.cache.get(Constants.Ids.Chs.ServerChats.CreationChat)! as Discord.TextChannel
    channel.messages.fetch({ limit: 30 }).catch(console.error)
    checkAllRooms(guild, core);

    new CronJob(
      "0 */5 * * * *",
      async () => {
        clantaxs(guild, core);
        LoveTaxs(guild, core);
      },
      null,
      true,
      "Europe/Moscow"
    );
    //Запуск кроны каждый мин
    new CronJob(
      "0 */1 * * * *",
      async () => {
        verifyTimeRoles(guild, core);
        const voiceChannels = await guild.channels.cache.filter(
          (ch) => ch.type === "voice"
        );
        voiceChannels.forEach((channel) => {
          const members = channel.members;
          members.forEach(async (member) => {
            if (!core.public.usersInVoice.has(member.id) && !member.user.bot)
              helpers.addUserFromVoice(member.id, core);
            if (member.user.bot) return 0;
            else {
              const userId = member.id;
              const userInVoice = core.public.usersInVoice.get(userId);
              if (userInVoice) {
                const dateNow = Date.now();
                const online = (dateNow - userInVoice.time) / 1000;
                if (online > 0)
                  await updateOnline(channel as Discord.VoiceChannel, online, member, core).catch(
                    console.error
                  );

                userInVoice.time = dateNow;
              }
            }
          });
        });
      },
      null,
      true,
      "Europe/Moscow"
    );
    updateBotPresence(core)
  })
  .once("error", (error) => {
    console.log(error);
  })
  .once("warn", (warn) => {
    console.log(warn);
  })
  .once("disconnect", () => {
    console.log("Lost connection to gateway :c");
  });
core.public.cooldown = new Discord.Collection();
core.public.usersInVoice = new Discord.Collection();
core.public.objs = require("./util/objects");

process.once("SIGINT", () => {
  saveOnlineHandler();

  console.log("Unexpected drop :o");
  process.exit(1);
});
const saveOnlineHandler = () => {
  core.public.usersInVoice.forEach(async (u: any) => {
    const guild = core.guilds.cache.get(Constants.Ids.guilds[0]);
    const dateNow = Date.now();
    const online = (dateNow - u.time) / 1000;
    const member = guild?.members.cache.get(u.id)!;
    const channel = guild?.channels.cache.get(
      member?.voice.channelID ? member?.voice.channelID : "null"
    );
    if (online > 0) {
      await updateOnline(channel as Discord.VoiceChannel, online, member, core);
      u.time = dateNow;
    }
  });
};

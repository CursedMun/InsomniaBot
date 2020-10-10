const StaffRoles = {
  eventCreator: "530475930695499796",
  curator: "609071999444189214",
  moderator: "509465866270933008",
  administrator: "508706031338127360",
  dev: "572775721101950997",
};
const Roles = {
  LoveRole: "743916507200749640",
  Sponsor: "582250613371437123",
  ServerBooster: "587700536468308006",
  Demon: "543791040797212684",
  Novolunie: "724265086872584303",
};
const MiscRoles = {
  eventBan: "760903864282513429",
  bots: "613597142405087240",
  voice: "648609254227574788",
  Male: "561494954266853376",
  Female: "561494950336790539",
};
const LevelRoles = {
  one: "508706096983310340",
  two: "543790160257744896",
  three: "543790932986822667",
  four: "543790934802825221",
  five: "543790937218744330",
  six: "543791040797212684",
  seven: "724265086872584303",
};
namespace Constants {
  export const Ids = {
    dev: {
      Dev: "423946555872116758",
      DevChannel: "677145709081919509",
    },
    guilds: ["508698707861045248"],
    Chs: {
      ServerChats: {
        MainChat: "605160710049366018",
        FloodChat: "605187837628776478",
        FloodMusic: "643025204167180289",
        AdminChat: "605183169976729601",
        GenderChat: "642501581559955477",
        PaymentsChat: "743918034535710781",
        CreationChat: "605185840750002177",
        NewsChat: "656586135690149893"
      },
      Private: {
        channel: "642713438514053120",
        parentID: "642713375255822345",
        maxUserLimit: 2,
      },
      Clan: {
        channel: "616299042573647890",
        parentID: "605182646791831564",
        ToNotDelete: [
          "696761489708548206",
          "747458280342814881",
          "747458363457011792",
          "744486519787618444",
          "747459011258875974",
        ],
      },
      Events: {
        channel: "605206089016803356",
        parentID: "605185365632090132",
      },
      Love: {
        channel: "605286867381911563",
        parentID: "605286664796897291",
        maxUserLimit: 2,
      },
    },
    Roles: {
      LevelRoles: LevelRoles,
      Staff: StaffRoles,
      Users: Roles,
      MiscRoles: MiscRoles,
    },
    ChannelTypes: {
      Privates: 1,
      ClanChannels: 2,
      EventChannels: 3,
      LoveChannels: 4,
    },
    ConfigRoles: {
      loveposition: "610570264329060426",
      colorsposition: "543789894217105418",
      selfcolorsposition: "543789894217105418",
      clanposition: "640999627658625068",
    },
  };

  export const Colors = {
    ECONOMY: "F78DA7",
    DAILY: "00D084",
    INFO: "F8E71C",
    BOX: "FFBB9D",
    DANGER: "FF0000",
    WARNING: "FFB200",
    INVIS: "CE2626",
    shops: "7BDCB5",
  };

  export const TransactionsTypes = {
    1: "Изъятие",
    2: "Покупка личной роли",
    3: "Покупка в магазине",
    4: "Пара",
    5: "Пополнение сообщества",
    6: "Создание сообщества",
    7: "Бой",
    8: "Колесо",
    9: "Ставка",
    10: "Емодзи",
    11: "Реакция",
    12: "Продление Роли",
    13: "Покупка картинки профиля",
    14: "S.UP",
    15: "Bump"
  }
  export const ClanTypes = {
    1: "Смена название",
    2: "Смена цвета",
    3: "Покупка слотов",
    4: "Смена картинки"
  }
  export const Bets = {
    BetFlipGuess: {
      H: 1,
      Head: 1,
      Heads: 1,
      T: 2,
      Tail: 2,
      Tails: 2,
    },
    BetFlip: {
      multiplier: 1,
      images: {
        head: "https://i.imgur.com/xYS20bz.png",
        tail: "https://i.imgur.com/a9PEBMX.png",
      },
    },
  };
  export const PermLevels = {
    Demon: 2,
    Novolunie: 3,
    NitroBooster: 4,
    Donater: 5,
    EventCreator: 6,
    Curator: 7,
    Moderator: 8,
    Administrator: 9,
    Dev: 10,
  };
  export const rndSentences = [
    "Где я ?",
    "Я тут главный",
    "Заходите",
    "Ищу парня",
    "Ищу девушку",
    "Все сюда",
    "Night",
    "Чилим",
    "РофланОбщение",
    "Кроватка",
    "Клетка",
    "Жду чуда",
    "Я тут!",
    "Настроить>>>",
    "Вечер в хату",
    "Сычевальня",
    "Космос",
    "Поиграем ?",
    "Люблю вас",
    "Одиночество",
    "Хочу бан",
    "Психушка",
    "Я бот",
    "Улетаю",
    "На заводе",
    "Котик",
    "Люблю печеньки",
    "Шахта",
    "Майнкрафт?",
    "Донбасс",
    "Москва",
    "Киев",
    "Минск",
    "Хочу...",
    "Невесомость",
    "Читаю чат",
    "Аниме сила",
    "Довакин",
    "Черная дыра",
    "Вселенная",
    "Эйфория",
    "Лабиринт",
    "Мир снов",
    "Сюда или бан",
    "Венеция",
    "Древний Рим",
    "ЭТО СПАРТА!",
    "Только 18+",
    "Спальня",
    "Chill",
    "В клетке",
    "Хочу общаться",
    "Детдом",
    "Ущелье ;)",
    "Кроличья нора",
    "Жду братков",
  ];
}

export = Constants;

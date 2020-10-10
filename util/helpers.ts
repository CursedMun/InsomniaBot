import http from "http";
import https from "https";
import { parse as parseUrl } from "url";
import { Embed, Discord, Core } from "discore.js";
import Constants from "./Constants";
import { stringify } from "querystring";

interface IRequestOptions {
  method?: string;
  url?: string;
  headers?: { [key: string]: any };
}

type TRequestMethod = string | IRequestOptions;
type TRequestUrl = string | IRequestOptions;

class RequestResponse {
  public body: string;

  constructor(chunks: any[]) {
    this.body = Buffer.concat(chunks).toString();
  }

  public text(): Promise<string> {
    return new Promise((resolve) => resolve(this.body));
  }

  public json(): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      try {
        const body = JSON.parse(this.body);
        resolve(body);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export function request(url: string): Promise<RequestResponse>;
export function request(url: string, method: string): Promise<RequestResponse>;
export function request(
  url: string,
  options: IRequestOptions
): Promise<RequestResponse>;
export function request(
  url: string,
  method: string,
  options: IRequestOptions
): Promise<RequestResponse>;
export function request(options: IRequestOptions): Promise<RequestResponse>;
export function request(
  url: TRequestUrl,
  method?: TRequestMethod,
  options: IRequestOptions = {}
): Promise<RequestResponse> {
  return new Promise((resolve, reject) => {
    if (typeof method === "object") options = method;
    if (typeof url === "object") options = url;
    if (typeof method === "string") options.method = method;
    if (typeof url === "string") options.url = url;
    const parsedUrl = parseUrl(options?.url ? options.url : "null");
    const req = (parsedUrl.protocol === "https:" ? https : http).request;
    options = { ...parsedUrl, ...options };
    req(options, (res) => {
      const chunks: any[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(new RequestResponse(chunks)));
      res.on("error", reject);
    })
      .on("error", reject)
      .end();
  });
}

function newRequest(method: string) {
  function req(url: string): Promise<RequestResponse>;
  function req(url: string, options: IRequestOptions): Promise<RequestResponse>;
  function req(url: string, options: IRequestOptions): Promise<RequestResponse>;
  function req(options: IRequestOptions): Promise<RequestResponse>;
  function req(url: TRequestUrl, options: IRequestOptions = {}) {
    if (typeof url === "object") options = url;
    if (typeof url === "string") options.url = url;
    options.method = method;
    return request(options);
  }
  return req;
}
request.get = newRequest("GET");
request.post = newRequest("POST");
request.delete = newRequest("DELETE");
request.put = newRequest("PUT");

export function log(...args: any[]) {
  console.log(...args);
}
log.bot = (...args: any) => log("[Bot]", ...args);
log.err = (...args: any) => log("[Error]", ...args);
log.main = (...args: any) => log("[Main]", ...args);
log.info = (...args: any) => log("[Info]", ...args);
log.test = (...args: any) => log("[Test]", ...args);

export function createEmbed(message: Discord.Message): Embed {
  return new Embed()
    .setColor(Constants.Colors.INVIS)
    .setFooter(message.author.tag, message.author.displayAvatarURL())
    .setTimestamp();
}

export function getPermsType(
  perms: Discord.PermissionOverwrites | undefined,
  flag: number
): number {
  const allow = <number>(perms?.allow || 0);
  const deny = <number>(perms?.deny || 0);
  if (allow & flag) return 1;
  if (deny & flag) return -1;
  return 0;
}

export function getPermsDiff(
  oldPerms: Discord.PermissionOverwrites,
  newPerms: Discord.PermissionOverwrites
) {
  const oldDefaults =
    Discord.Permissions.ALL ^
    (<number>(<unknown>(oldPerms?.allow || 0))) ^
    (<number>(<unknown>(oldPerms?.deny || 0)));
  const newDefaults =
    Discord.Permissions.ALL ^
    (<number>(<unknown>(newPerms?.allow || 0))) ^
    (<number>(<unknown>(newPerms?.deny || 0)));

  const editedAllows =
    (<number>(<unknown>(oldPerms?.allow || 0))) ^
    (<number>(<unknown>(newPerms?.allow || 0)));
  const editedDefaults = oldDefaults ^ newDefaults;
  const editedDenies =
    (<number>(<unknown>(oldPerms?.allow || 0))) ^
    (<number>(<unknown>(newPerms?.allow || 0)));

  return editedAllows | editedDefaults | editedDenies;
}
/**
 * Pluralize a word
 * @param count how much
 * @param one first word
 * @param two second in plural
 * @param five fifth in plural
 */
export function pluralize(
  count: number,
  one: string,
  two: string,
  five: string
): string {
  count = Math.floor(Math.abs(count)) % 100;
  if (count > 10 && count < 20) return five;
  count %= 10;
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return two;
  return five;
}
/**
 * Generate ID
 */
export class ID {
  public id: string;
  public static epoch = 1577836800000;
  public static proc = Math.floor(Math.random() * 0x040) % 0x040;

  constructor(id?: ID | string) {
    if (id) {
      this.id = typeof id === "string" ? id : id.id;
    } else {
      this.id = ID.generate();
    }
  }

  public timestamp() {
    const bitwiseID = Number(this.id).toString(2);
    const diff = Number(bitwiseID.substr(this.id.length - 7));
    return ID.epoch + diff;
  }

  public static generate() {
    const inc = ID.proc;
    const id = String(
      parseInt(`${(Date.now() - ID.epoch).toString(2)}0000000`, 2) + inc
    );

    ID.proc = (ID.proc + 1) % 0x040;

    return id;
  }
}

export function capitalize(text: string): string {
  return `${text[0].toUpperCase()}${text.substr(1).toLowerCase()}`;
}

export function randomHexColor() {
  const hexTable = [
    "CD5C5C",
    "FFA07A",
    "8B0000",
    "FFC0CB",
    "FF1493",
    "DB7093",
    "FFA07A",
    "FF4500",
    "FFA500",
    "FFD700",
    "FFEFD5",
    "BDB76B",
    "E6E6FA",
    "FF00FF",
    "9400D3",
    "4B0082",
    "483D8B",
    "FFF8DC",
    "BC8F8F",
    "DAA520",
    "D2691E",
    "A52A2A",
    "000000",
    "FFFFFF",
    "800080",
    "000080",
    "0000FF",
    "#008080",
    "00FFFF",
    "008000",
    "00FF00",
    "808000",
    "FFFF00",
    "FF0000",
    "2F4F4F",
    "708090",
    "808080",
    "FFE4E1",
    "F5F5DC",
    "7B68EE",
    "87CEEB",
    "00CED1",
    "7FFFD4",
    "20B2AA",
    "808000",
    "2E8B57",
    "98FB98",
  ];

  const rndHex = Math.floor(Math.random() * hexTable.length);

  return hexTable[rndHex];
}

export function repeat(str: string, n: number) {
  let res = "";
  for (let i = 0; i < n; i++) res += str;

  return res;
}

export function updateBotPresence(Core: Core) {
  const guild: Discord.Guild | undefined = Core.guilds.cache.get(
    Constants.Ids.guilds[0]
  );
  return Core?.user?.setActivity(`на ${guild?.memberCount} участников`, {
    type: "WATCHING",
  });
}

export function convert(time: number) {
  // Months array
  var months_arr = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];

  // Convert timestamp to milliseconds
  time = time + 480 * 60;
  var date = new Date(time * 1000);
  // Year
  var year = date.getFullYear();

  // Month
  var month = months_arr[date.getMonth()];

  // Day
  var day = date.getDate();

  // Hours
  var hours = date.getHours();

  // Minutes
  var minutes = "0" + date.getMinutes();

  // Seconds
  var seconds = "0" + date.getSeconds();

  // Display date time in MM-dd-yyyy h:m:s format
  var convdataTime =
    "**" +
    day +
    "** " +
    month +
    " `" +
    hours +
    ":" +
    minutes.substr(-2) +
    ":" +
    seconds.substr(-2) +
    "`";

  return convdataTime;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function addUserFromVoice(id?: string, Core?: Core) {
  const userInVoice = Core!.public.usersInVoice.get(id)
  if (userInVoice) return;
  return Core!.public.usersInVoice.set(id, {
    id,
    time: Date.now(),
  });
}

export function removeUserFromVoice(Core: Core, id: string) {
  const userInVoice = Core!.public.usersInVoice.get(id)
  if (userInVoice) return Core!.public.usersInVoice.delete(id)
}

export function unixTime() {
  return Math.floor(new Date().getTime() / 1000)
}


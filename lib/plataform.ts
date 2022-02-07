import { oauth, Page } from "../deps.ts";

abstract class Platform {
  abstract post(page:Page): Promise<string | undefined>;
}

class Twitter implements Platform {
  api_key: string;
  api_key_secret: string;
  user_key: string;
  user_key_secret: string;
  constructor() {
    this.api_key = Deno.env.get("API_KEY") || "";
    this.api_key_secret = Deno.env.get("API_KEY_SECRET") || "";
    this.user_key = Deno.env.get("ACCESS_TOKEN") || "";
    this.user_key_secret = Deno.env.get("ACCESS_TOKEN_SECRET") || "";
  }
  async post(page: Page): Promise<string | undefined> {
    const baseLink = (<{[index:string]:string}>page.data.site).url
    const pageLink = page.data.url;
    const fullLink = `${baseLink}${pageLink}`;
    const api = new oauth.Api({
      prefix: "https://api.twitter.com/2",
      consumer: { key: this.api_key, secret: this.api_key_secret },
      signature: oauth.HMAC_SHA1,
    });

    const response = await api.request("POST", "/tweets", {
      token: { key: this.user_key, secret: this.user_key_secret },
      json: { text: `New post in the blog site! Show it on: ${fullLink}` },
      hashBody: true,
    });

    if (response.ok) {
      const result = await response.json();
      const id = result["data"]["id"];
      return id;
    }
  }
}

class Telegram implements Platform {
  channel: string;
  bot_api_key: string;
  base_url = "https://api.telegram.org/";
  constructor() {
    this.channel = Deno.env.get("TELEGRAM_CHANNEL_ID") || "";
    this.bot_api_key = Deno.env.get("TELEGRAM_BOT_API_KEY") || "";
  }
  async post(page: Page): Promise<string | undefined> {
    const baseLink = (<{[index:string]:string}>page.data.site).url
    const pageLink = page.data.url;
    const fullLink = `${baseLink}${pageLink}`;
    const bot_api_key = this.bot_api_key;
    const botURl = `bot${bot_api_key}/`;
    const endpointUrl = `${this.base_url}${botURl}sendMessage`;
    const message = `New post in the blog site! Show it on: ${fullLink}`;
    const channel = this.channel;
    const finalUrl = `${endpointUrl}?chat_id=${channel}&text=${message}`;

    const response = await fetch(finalUrl);
    if (response.ok) {
      const result = await response.json();
      const id = result["result"]["message_id"];
      return id;
    }
  }
}

export class PlatformFactory {
  static getPlatform(platform: string): Platform {
    switch (platform) {
      case "twitter":
        return new Twitter();
      case "telegram":
        return new Telegram();
      default:
        throw `Not defined platform ${platform}`;
    }
  }
}

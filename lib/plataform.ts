import { i18next, oauth, Page, Site } from "../deps.ts";
import { Options } from "./interfaces.ts";

import en from "../locales/en.json" assert { type: "json" };
import es from "../locales/es.json" assert { type: "json" };

i18next
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
    },
  });

abstract class Platform {
  abstract post(page: Page): Promise<string | undefined>;
}

class Twitter implements Platform {
  api_key: string;
  api_key_secret: string;
  user_key: string;
  user_key_secret: string;
  site: Site;
  constructor(options: Options, site: Site) {
    this.api_key = options.publish.platforms.twitter.api_key;
    this.api_key_secret = options.publish.platforms.twitter.api_key_secret;
    this.user_key = options.publish.platforms.twitter.access_token;
    this.user_key_secret =
      options.publish.platforms.twitter.access_token_secret;
    this.site = site;
  }
  async post(page: Page): Promise<string | undefined> {
    const language = (page.data.site as { [index: string]: string }).language;
    const t = i18next.getFixedT(language || "en");
    const fullLink = this.site.url(<string> page.data.url, true);
    const api = new oauth.Api({
      prefix: "https://api.twitter.com/2",
      consumer: { key: this.api_key, secret: this.api_key_secret },
      signature: oauth.HMAC_SHA1,
    });

    const response = await api.request("POST", "/tweets", {
      token: { key: this.user_key, secret: this.user_key_secret },
      json: {
        text: t("MESSAGE_POST", { url: fullLink }),
      },
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
  site: Site;
  constructor(options: Options, site: Site) {
    this.channel = options.publish.platforms.telegram.channel_id;
    this.bot_api_key = options.publish.platforms.telegram.bot_api_key;
    this.site = site;
  }
  async post(page: Page): Promise<string | undefined> {
    const language = (page.data.site as { [index: string]: string }).language;
    const t = i18next.getFixedT(language || "en");
    const fullLink = this.site.url(<string> page.data.url, true);
    const bot_api_key = this.bot_api_key;
    const botURl = `bot${bot_api_key}/`;
    const endpointUrl = `${this.base_url}${botURl}sendMessage`;
    const message = t("MESSAGE_POST", { url: `${fullLink}` });
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
  static getPlatform(platform: string, options: Options, site: Site): Platform {
    switch (platform) {
      case "twitter":
        return new Twitter(options, site);
      case "telegram":
        return new Telegram(options, site);
      default:
        throw `Not defined platform ${platform}`;
    }
  }
}

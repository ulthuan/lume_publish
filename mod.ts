import { Publish } from "./lib/publish.ts";
import { Options } from "./lib/interfaces.ts";

import { merge, Site } from "./deps.ts";

const defaults: Options = {
  extensions: [".md"],
  publish: {
    enable: <boolean> (Deno.env.get("PUBLISH") || false),
    platforms: {
      twitter: {
        api_key: Deno.env.get("TWITTER_API_KEY") || "",
        api_key_secret: Deno.env.get("TWITTER_API_KEY_SECRET") || "",
        access_token: Deno.env.get("TWITTER_ACCESS_TOKEN") || "",
        access_token_secret: Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET") || "",
      },
      telegram: {
        channel_id: Deno.env.get("TELEGRAM_CHANNEL_ID") || "",
        bot_api_key: Deno.env.get("TELEGRAM_BOT_API_KEY") || "",
      },
    },
    vcs: {
      github: {
        token: Deno.env.get("GITHUB_TOKEN") || "",
        repository: Deno.env.get("GITHUB_REPOSITORY") || "",
      },
    },
  },
};

export function publish(userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);
  return (site: Site) => {
    if (options.publish) {
      const publish = new Publish(options, site);
      site.preprocess(options.extensions, publish.publish());
      site.process(options.extensions, publish.publishCopy());
    }
  };
}

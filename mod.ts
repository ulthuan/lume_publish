import {
  publish as libPublish,
  publishCopy as libPublishCopy,
} from "./lib/publish.ts";

import { configAsync, merge, Site } from "./deps.ts";

export interface Options {
  extensions: string[];
}

const defaults: Options = {
  extensions: [".md"],
};

export function publish(userOptions?: Partial<Options>) {
  configAsync({ export: true });
  const options = merge(defaults, userOptions);
  return (site: Site) => {
    site.preprocess(options.extensions, libPublish);
  };
}

export function publishCopy(userOptions?: Partial<Options>) {
  configAsync({ export: true });
  const options = merge(defaults, userOptions);
  return (site: Site) => {
    site.process(options.extensions, libPublishCopy);
  };
}

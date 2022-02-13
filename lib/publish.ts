import {
  basename,
  dirname,
  encode64,
  merge,
  Page,
  Site,
  Ystringify,
} from "../deps.ts";
import { PlatformFactory } from "./plataform.ts";
import { Options } from "./interfaces.ts";

export class Publish {
  options: Options;
  site: Site;
  constructor(options: Options, site: Site) {
    this.options = options;
    this.site = site;
  }
  private checkPlatform(
    publishData: { [index: string]: string | undefined },
  ): boolean {
    let needPublish = false;
    for (const p of Object.keys(publishData)) {
      if (publishData[p] == undefined) {
        needPublish = true;
        break;
      }
    }
    return needPublish;
  }

  publish() {
    return async (page: Page) => {
      if ((!page.data.draft) && (page.data.publish)) {
        const publishData = page.data.publish as {
          [index: string]: string | undefined;
        };
        if (this.checkPlatform(publishData)) {
          const publish: { [index: string]: string } = {};
          for (const platform of Object.keys(publishData)) {
            const pub = PlatformFactory.getPlatform(
              platform,
              this.options,
              this.site,
            );
            const resp = await pub.post(page);
            if (resp != undefined) {
              publish[platform] = resp;
            }
          }
          page._data["publish"] = publish;
        }
      }
    };
  }
  publishCopy() {
    return async (page: Page) => {
      if (
        (!page.data.draft) && page._data.publish != undefined && page.baseData
      ) {
        const filename = `${page.src.path}${page.src.ext}`;
        const page_content = page.baseData.content;
        const new_page_data = merge(page.baseData, page._data);
        const page_data: { [index: string]: unknown } = {};
        for (const objKey of Object.keys(new_page_data)) {
          if (objKey === "content") {
            continue;
          }
          page_data[objKey] = new_page_data[objKey];
        }
        const frontmatter = Ystringify(page_data);
        const new_page_content = `---\n${frontmatter}---${page_content}`;
        const repository = this.options.publish.vcs.github.repository;
        const github_token = this.options.publish.vcs.github.token;
        if (repository) {
          const response_sha = await fetch(
            `https://api.github.com/repos/${repository}/git/trees/main:${
              dirname(filename).slice(1)
            }`,
            {
              method: "GET",
              headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `token ${github_token}`,
              },
            },
          );
          const files = await response_sha.json();
          const sha_file =
            files["tree"].filter((file: { [index: string]: string }) => {
              return file.path == basename(filename);
            }).pop()["sha"];
          const response_update = await fetch(
            `https://api.github.com/repos/${repository}/contents${filename}`,
            {
              method: "PUT",
              headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `token ${github_token}`,
              },
              body: JSON.stringify({
                message:
                  `[no ci] feat(page): Update frontmatter of ${page.src.path}`,
                content: encode64(new_page_content),
                sha: sha_file,
              }),
            },
          );
          if (response_update.ok) {
            console.log(`Post update ${filename}`);
          }
        }
      }
    };
  }
}

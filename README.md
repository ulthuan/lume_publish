# Publish plugin for Lume
This plugin create a new post on the social network that specify in the frontmatter of each page and update on your vcs the page on the frontmatter with ids of the posts on each social network.

In the actual version of the plugin the next social networks are supported:
* Twitter
* Telegram

and the vcs supported is Github (only .com version)

The requirement for the use of this plugin are the next environment variable:

* Twitter: You can find all of them in your Twitter Developer Platform account
  * API_KEY
  * API_KEY_SECRET
  * ACCESS_TOKEN
  * ACCESS_TOKEN_SECRET
* Telegram:
  * TELEGRAM_CHANNEL_ID: The channel name or the id if it's a private channel
  * TELEGRAM_BOT_API_KEY
* Github:
  * GITHUB_REPOSITORY
  * GITHUB_TOKEN
* Plugin itself:
  * PUBLISH (boolean): Prevent to do the publish on the development environment

This plugin are only tested in the actual version over .md kind of page

## Example
For use this plugin in your lume instance you need to import this library and use the "use" function of your site object:

```
site
  .ignore("README.md")
  .use(publish())
  .use(publishCopy())
  ...
```
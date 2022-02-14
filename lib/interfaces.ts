export interface Options {
  extensions: string[];
  publish: {
    enable: string;
    platforms: {
      twitter: {
        api_key: string;
        api_key_secret: string;
        access_token: string;
        access_token_secret: string;
      };
      telegram: {
        channel_id: string;
        bot_api_key: string;
      };
    };
    vcs: {
      github: {
        token: string;
        repository: string;
      };
    };
  };
}

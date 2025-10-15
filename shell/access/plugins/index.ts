export type SearchResult = {
  title: string;
  icon?: string;
  description?: string;
  plugin: PluginInfo;
};

export type PluginInfo = {
  name: string;
  icon: string;
};

export abstract class Plugin {
  public pluginInfo: PluginInfo;

  constructor(
    public name: string,
    public icon: string,
    public useByDefault: boolean,
    public shortcut: string
  ) {
    this.pluginInfo = {
      name: this.name,
      icon: this.icon,
    };
  }

  abstract results(search: string): Promise<SearchResult[]>;

  makeResult(title: string, icon?: string, description?: string): SearchResult {
    return {
      title,
      icon,
      description,
      plugin: this.pluginInfo,
    };
  }
}

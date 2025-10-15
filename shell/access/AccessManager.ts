import { Plugin, SearchResult } from "./plugins";

export class AccessManager {
  private plugins: Plugin[] = [];

  addPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  async results(search: string): Promise<SearchResult[]> {
    const results = await Promise.all(
      this.plugins.map((p) => p.results(search))
    );

    return results.flat();
  }
}

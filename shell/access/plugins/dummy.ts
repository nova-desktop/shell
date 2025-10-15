import { Plugin, SearchResult } from "./index";

const list = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eight"
]

export class DummyPlugin extends Plugin {
  constructor() {
    super("Dummy", "❓️", true, "d");
  }

  async results(search: string): Promise<SearchResult[]> {
    return list.filter((v) => v.toLowerCase().includes(search)).map(v => this.makeResult(v))
  }
}

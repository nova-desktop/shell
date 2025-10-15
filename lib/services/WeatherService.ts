import GObject, { property, register } from "ags/gobject";
import { readFile } from "ags/file";
import { interval } from "ags/time";
import fetch from "ags/fetch";

@register()
export class WeatherService extends GObject.Object {
  @property(String)
  short: string;

  @property(String)
  long: string;

  #location = readFile("/home/ozoku/.local/location.txt");

  constructor() {
    super();

    this.short = "";
    this.long = "";

    interval(60 * 60 * 1000, () => this.#update());
  }

  async #update() {
    const short = await fetch(this.#url(1))
      .then((r) => r.text())
      .catch(console.error);
    const long = await fetch(this.#url(4))
      .then((r) => r.text())
      .catch(console.error);

    this.short = short?.trim() ?? "☁️ ❌";
    this.long = long?.trim() ?? "Error getting weather";
  }

  #url(format: number): string {
    return `https://wttr.in/${this.#location.trim()}?format=${format}`;
  }
}

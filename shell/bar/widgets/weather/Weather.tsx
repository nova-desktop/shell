import { createBinding } from "ags";
import { WeatherService } from "../../../../lib/services/WeatherService";

const weather = new WeatherService();

export default function WeatherStatus() {
  return (
    <box>
      <label
        label={createBinding(weather, "short").as((v) => v.split(" ")[0] + " ")}
        tooltipMarkup={createBinding(weather, "long")}
      />
      <label
        label={createBinding(weather, "short").as((v) => v.split(" ").filter(Boolean)[1] ?? "")}
        tooltipMarkup={createBinding(weather, "long")}
      />
    </box>
  );
}

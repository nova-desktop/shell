import { createBinding, createComputed } from "ags";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();

const icon = createComputed([createBinding(battery, "percentage"), createBinding(battery, "state")],
  (percent, charging) => {
    percent *= 100;
    if (charging === Battery.State.CHARGING) return "󰂄";
    if (charging === Battery.State.PENDING_CHARGE) return "󰚥";
    if (percent >= 100) return "󰁹";
    if (percent >= 90) return "󰂂";
    if (percent >= 80) return "󰂁";
    if (percent >= 70) return "󰂀";
    if (percent >= 60) return "󰁿";
    if (percent >= 50) return "󰁾";
    if (percent >= 40) return "󰁽";
    if (percent >= 30) return "󰁼";
    if (percent >= 20) return "󰁻";
    if (percent >= 10) return "󰁺";
    return "󰂎";
  }
);

const tooltip = createComputed([createBinding(battery, "percentage"), createBinding(battery, "state"), createBinding(battery, "timeToEmpty"), createBinding(battery, "timeToFull")], (percent, state, timeToEmpty, timeToFull) => {
  percent *= 100
  const time = state === Battery.State.CHARGING ? timeToFull : timeToEmpty;
  const percentText = `${percent.toFixed(0)}%`;
  const tS = time % 60
  const tM = ((time - tS) / 60) % 60
  const tH = (((time - tS) / 60) - tM) / 60
  const tf = `${tH}h ${tM}min`;
  if (state === Battery.State.CHARGING) return `${percentText} - ${tf} until charged`;
  if (state === Battery.State.PENDING_CHARGE) return `${percentText} - Plugged In`;
  return `${percentText} - ${tf} remaining`;
})

export default function BatteryStatus() {
  return (
    <box>
      {/*<label label={createBinding(battery, "percentage").as((p) => `${(p*100).toFixed(0)}% `)} />*/}
      <label label={icon} tooltipMarkup={tooltip} cssClasses={["icon"]} />
    </box>
  );
}

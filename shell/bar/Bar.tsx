import { Astal, Gdk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Hyprland from "gi://AstalHyprland";
import style from "./Bar.scss";
import BatteryStatus from './widgets/battery/Battery';
import Clock from "./widgets/clock/Clock";
import SysTray from "./widgets/tray/Tray";
import Volume from "./widgets/volume/Volume";
import NetworkStatus from "./widgets/network/Network";
import WeatherStatus from "./widgets/weather/Weather";
import Media from "./widgets/media/Media";
import ActiveWindow from "./widgets/focusedwindow/FocusedWindow";
import { createBinding, onCleanup } from "ags";
import Workspaces from "./widgets/workspaces/Workspaces";

const hyprland = Hyprland.get_default();

export default function Bar({gdkmonitor, i}:{gdkmonitor: Gdk.Monitor, i: number}) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  app.apply_css(style);

  const monitor = createBinding(hyprland, "monitors").as(
    (monitors) =>
      monitors.find(
        (m) => m.name.toLowerCase() === gdkmonitor.connector.toLowerCase()
      )
  );

  return (
    <window
      visible
      name={`bar${i}`}
      cssClasses={["bar"]}
      gdkmonitor={gdkmonitor}
      marginTop={8}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
      $={(self) => onCleanup(() => self.destroy())}
    >
      <centerbox cssClasses={["bar"]}>
        <box $type="start" spacing={8}>
          <box cssClasses={["pill", "pill-right"]}>
            <Workspaces monitor={monitor} />
          </box>
          <box>
            <ActiveWindow monitor={monitor} />
          </box>
        </box>
        <box $type="center" cssClasses={["pill", "pill-media"]}>
          <Media />
        </box>
        <box $type="end" spacing={8}>
          <box cssClasses={["pill"]}>
            <SysTray />
          </box>
          <box spacing={12} cssClasses={["pill"]}>
            <WeatherStatus />
            <Volume />
            <NetworkStatus />
            <BatteryStatus />
          </box>
          <box cssClasses={["pill", "pill-left"]}>
            <Clock />
          </box>
        </box>
      </centerbox>
    </window>
  );
}

import app from "ags/gtk4/app";
import style from "./PowerMenu.scss";
import { Astal, Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

app.apply_css(style);

const commands = {
  poweroff: "poweroff",
  reboot: "reboot",
  suspend: "systemctl suspend",
  lock: "loginctl lock-session",
  logout: "uwsm stop",
} as const;

export default function PowerMenu() {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  function clickHandler(task: keyof typeof commands) {
    return () => {
      app.toggle_window("powermenu");
      execAsync(commands[task]);
    };
  }

  return (
    <window
      name="powermenu"
      layer={Astal.Layer.TOP}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
    >
      <box class="transparent">
        <centerbox hexpand vexpand>
          <box $type="start" hexpand vexpand></box>
          <centerbox $type="center" orientation={Gtk.Orientation.VERTICAL}>
            <box $type="start" hexpand vexpand></box>
            <box $type="center" spacing={12} class="powermenu">
              <button
                class="powerbutton poweroff"
                onClicked={clickHandler("poweroff")}
              >
                <label label="󰐥" />
              </button>
              <button
                class="powerbutton reboot"
                onClicked={clickHandler("reboot")}
              >
                <label label="" />
              </button>
              <button
                class="powerbutton suspend"
                onClicked={clickHandler("suspend")}
              >
                <label label="󰤄" />
              </button>
              <button class="powerbutton lock" onClicked={clickHandler("lock")}>
                <label label="󰌾" />
              </button>
              <button
                class="powerbutton logout"
                onClicked={clickHandler("logout")}
              >
                <label label="" />
              </button>
            </box>
            <box $type="end" hexpand vexpand></box>
          </centerbox>
          <box $type="end" hexpand vexpand></box>
        </centerbox>
      </box>
    </window>
  );
}

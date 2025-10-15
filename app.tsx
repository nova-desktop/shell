import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./shell/bar/Bar";
import PowerMenu from "./shell/powermenu/PowerMenu";
import AccessWindow from "./shell/access/Access";
import { createBinding, For, This } from "ags";

app.start({
  css: style,
  main() {
    const monitors = createBinding(app, "monitors");

    PowerMenu();
    AccessWindow(app.get_monitors()[0]);

    return (
      <For each={monitors}>
        {(monitor, i) => (
          <This this={app}>
            <Bar gdkmonitor={monitor} i={i.get()} />
          </This>
        )}
      </For>
    );
  },
});

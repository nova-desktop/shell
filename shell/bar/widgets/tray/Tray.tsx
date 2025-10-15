import Tray from "gi://AstalTray";
import { createBinding, For, onCleanup } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import style from "./Tray.scss";
import app from "ags/gtk4/app";

function getLabel(item: Tray.TrayItem) {
  return item.id === "chrome_status_icon_1" ? item.tooltipMarkup : item.id;
}

const ignoredTrayItems = ["spotify-client", "Bitwarden"];

function filterTrayIcons(item: Tray.TrayItem) {
  return !ignoredTrayItems.includes(getLabel(item));
}

app.apply_css(style);

export default function SysTray() {
  const tray = Tray.get_default();

  const trayItems = createBinding(tray, "items").as((items) =>
    items
      .sort((a, b) => getLabel(a).localeCompare(getLabel(b)))
      .filter(filterTrayIcons)
  );

  return (
    <box class="tray">
      <For each={trayItems}>
        {(item) => {
          const pop = Gtk.PopoverMenu.new_from_model(item.menuModel);

          function init(btn: Gtk.Button) {
            pop.insert_action_group("dbusmenu", item.actionGroup);
            pop.set_has_arrow(false);
            pop.set_parent(btn);
            const conns = [
              item.connect("notify::menu-model", () => {
                pop.set_menu_model(item.menuModel);
              }),
              item.connect("notify::action-group", () => {
                pop.insert_action_group("dbusmenu", item.actionGroup);
              }),
            ];

            onCleanup(() => {
              pop.unparent();
              conns.map((id) => item.disconnect(id));
            });
          }

          return (
            <button
              $={init}
              tooltipMarkup={createBinding(item, "tooltipMarkup")}
            >
              <Gtk.GestureClick
                button={Gdk.BUTTON_PRIMARY}
                onPressed={() => pop.popup()}
              />
              <image gicon={createBinding(item, "gicon")} />
            </button>
          );
        }}
      </For>
    </box>
  );
}

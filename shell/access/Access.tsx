import app from "ags/gtk4/app";
import style from "./Access.scss";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { Accessor, createBinding, createState, For, onCleanup } from "ags";
import { AccessManager } from "./AccessManager";
import { DummyPlugin } from "./plugins/dummy";
import { SearchResult } from "./plugins";
import { throttle } from "../../lib/signals";

app.apply_css(style);

function Icon({ icon }: { icon: string }) {
  const isEmoji = /\p{Extended_Pictographic}/u.test(icon);

  return (
    <box class="access-result-icon">
      {isEmoji ? <label label={icon} /> : <image />}
    </box>
  );
}

const manager = new AccessManager();
manager.addPlugin(new DummyPlugin());

function Access() {
  const [search, setSearch] = createState("");
  const [results, setResults] = createState<SearchResult[]>([]);

  const [doSearch, cleanupSearch] = throttle(() => {
    manager.results(search.get()).then((results) => setResults(results));
  }, 20);

  const disposeSubscription = search.subscribe(() => {
    doSearch();
  });

  doSearch();

  onCleanup(() => {
    disposeSubscription();
    cleanupSearch();
  });

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <box class="access-input" halign={Gtk.Align.FILL}>
        <entry
          text={search}
          onNotifyText={(entry) => setSearch(entry.text)}
          hexpand
          placeholderText="Search for apps and commands"
        />
      </box>
      <scrolledwindow
        class="access-results"
        propagateNaturalHeight
        propagateNaturalWidth
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        maxContentHeight={500}
      >
        <box orientation={Gtk.Orientation.VERTICAL}>
          <For each={results}>
            {(result, i) => (
              <box
                class={i.as(
                  (i) =>
                    "access-result" + (i === 0 ? " access-result-focused" : "")
                )}
                spacing={8}
              >
                <Icon icon={result.icon || result.plugin.icon} />
                <box spacing={12}>
                  <label class="access-result-title" label={result.title} />
                  <label
                    class="access-result-plugin-name"
                    label={result.plugin.name}
                  />
                </box>
              </box>
            )}
          </For>
        </box>
      </scrolledwindow>
    </box>
  );
}

export default function AccessWindow(gdkmonitor: Gdk.Monitor) {
  const geo = gdkmonitor.get_geometry();

  return (
    <window
      name="access"
      layer={Astal.Layer.TOP}
      application={app}
      widthRequest={geo.width / 3}
      heightRequest={geo.height / 3}
      keymode={Astal.Keymode.ON_DEMAND}
      onNotifyVisible={(window, pspec) => {
        if (window.get_visible()) {

        }
      }}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({widget}, keyval) => {
          if (keyval === Gdk.KEY_Escape) {
            app.toggle_window("access")
          }
        }}
      />
      <box class="access">
        <Access />
      </box>
    </window>
  );
}

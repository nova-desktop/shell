import { Accessor, createBinding, createState } from "ags";
import Hyprland from "gi://AstalHyprland";
import { truncate } from "../../../../lib/utils";

const hyprland = Hyprland.get_default();

export default function ActiveWindow({
  monitor,
}: {
  monitor: Accessor<number>;
}) {
  const [activeWindow, setActiveWindow] = createState(
    hyprland.monitors.find((m) => m.id === monitor.get())!.activeWorkspace
      .lastClient?.title ?? ""
  );

  let currentTitleSubDiscard: () => void;
  let lastFocusedClientAddress = "";
  function focusedClientChange(focusedClient?: Hyprland.Client) {
    if (lastFocusedClientAddress === focusedClient?.address) {
      return;
    }

    if (focusedClient == null) {
      lastFocusedClientAddress = "";
      currentTitleSubDiscard?.();
      return;
    }

    currentTitleSubDiscard?.();
    const title = createBinding(focusedClient, "title");
    lastFocusedClientAddress = focusedClient.address;
    currentTitleSubDiscard = title.subscribe(() => {
      setActiveWindow(title.get());
    });
  }

  const focusedClient = createBinding(hyprland, "focusedClient");
  focusedClient.subscribe(() => {
    if (
      focusedClient.get()?.get_workspace()?.get_monitor()?.id === monitor.get()
    ) {
      focusedClientChange(focusedClient.get());
      setActiveWindow(focusedClient.get()?.title ?? "");
    }
  });

  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
  focusedWorkspace.subscribe(() => {
    if (focusedWorkspace.get().monitor.id === monitor.get()) {
      const client =
        focusedWorkspace.get().lastClient ?? focusedWorkspace.get().clients[0];
      focusedClientChange(client);
      setActiveWindow(client.title ?? "");
    }
  });

  function clientMoved() {
    const ws = hyprland.monitors.find(
      (m) => m.id === monitor.get()
    )!.activeWorkspace;

    if (ws.get_clients().length === 0) {
      focusedClientChange();
      setActiveWindow("");
    } else {
      const client = ws.clients[0];
      focusedClientChange(client);
      setActiveWindow(client.title);
    }
  }

  hyprland.connect("client-moved", clientMoved);
  hyprland.connect("client-removed", clientMoved);

  return (
    <box cssClasses={activeWindow.as((t) => [t ? "pill" : ""].filter(Boolean))}>
      <label label={activeWindow.as(truncate)} />
    </box>
  );
}

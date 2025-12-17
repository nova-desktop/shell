import {
  Accessor,
  createBinding,
  createEffect,
  createState,
  onCleanup,
} from "ags";
import Hyprland from "gi://AstalHyprland";
import { truncate } from "../../../../lib/utils";

const hyprland = Hyprland.get_default();

export default function ActiveWindow({
  monitor,
}: {
  monitor: Accessor<Hyprland.Monitor | undefined>;
}) {
  const [activeWindow, setActiveWindow] = createState("");

  let currentTitleSubDiscard: (() => void) | undefined;
  let lastFocusedClientAddress = "";
  let lastMonitorId: number | undefined;

  const resetActiveWindow = () => {
    currentTitleSubDiscard?.();
    currentTitleSubDiscard = undefined;
    lastFocusedClientAddress = "";
    setActiveWindow("");
  };

  const watchClientTitle = (client?: Hyprland.Client | null) => {
    if (!client) {
      resetActiveWindow();
      return;
    }

    if (lastFocusedClientAddress === client.address) {
      return;
    }

    currentTitleSubDiscard?.();
    const title = createBinding(client, "title");
    lastFocusedClientAddress = client.address;
    currentTitleSubDiscard = title.subscribe(() => {
      setActiveWindow(title());
    });
  };

  const updateFromWorkspace = () => {
    const mon = monitor();

    if (mon?.id !== lastMonitorId) {
      lastMonitorId = mon?.id;
      resetActiveWindow();
    }

    if (!mon) {
      resetActiveWindow();
      return;
    }

    const ws = mon.activeWorkspace;
    const client = ws.lastClient ?? ws.clients[0];

    if (!client) {
      resetActiveWindow();
      return;
    }

    watchClientTitle(client);
    setActiveWindow(client.title ?? "");
  };

  const focusedClient = createBinding(hyprland, "focusedClient");
  createEffect(() => {
    const mon = monitor();
    const client = focusedClient();

    if (!mon) {
      resetActiveWindow();
      return;
    }

    if (client?.get_workspace()?.get_monitor()?.id === mon.id) {
      watchClientTitle(client);
      setActiveWindow(client?.title ?? "");
    }
  });

  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
  createEffect(() => {
    const mon = monitor();
    const ws = focusedWorkspace();

    if (!mon || !ws) {
      return;
    }

    if (ws.monitor.id === mon.id) {
      const client = ws.lastClient ?? ws.clients[0];

      if (!client) {
        resetActiveWindow();
        return;
      }

      watchClientTitle(client);
      setActiveWindow(client.title ?? "");
    }
  });

  const clientMoved = () => updateFromWorkspace();
  const movedId = hyprland.connect("client-moved", clientMoved);
  const removedId = hyprland.connect("client-removed", clientMoved);

  onCleanup(() => {
    currentTitleSubDiscard?.();
    hyprland.disconnect(movedId);
    hyprland.disconnect(removedId);
  });

  createEffect(() => {
    // keep state in sync when monitor accessor changes
    monitor();
    updateFromWorkspace();
  });

  return (
    <box cssClasses={activeWindow.as((t) => [t ? "pill" : ""].filter(Boolean))}>
      <label label={activeWindow.as(truncate)} />
    </box>
  );
}

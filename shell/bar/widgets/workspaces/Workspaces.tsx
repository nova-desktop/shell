import {
  Accessor,
  CCProps,
  createBinding,
  createComputed,
  createState,
  For,
  With,
} from "ags";
import app from "ags/gtk4/app";
import style from "./Workspaces.scss";
import AstalHyprland from "gi://AstalHyprland";
import { Gtk } from "ags/gtk4";

app.apply_css(style);

type ButtonProps = CCProps<Gtk.Button, Gtk.Button.ConstructorProps>;
type WorkspaceButtonProps = Partial<ButtonProps> & {
  ws: AstalHyprland.Workspace;
  num: number;
};

const hyprland = AstalHyprland.get_default();

const [clientMoved, setMoveCount] = createState(1);
hyprland.connect("client-moved", () => {
  setMoveCount((last) => last + 1);
});

const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

function WorkspaceButton({ ws, num, ...props }: WorkspaceButtonProps) {
  const hasClients = createBinding(ws, "clients").as(
    (clients) => clients.length > 0
  );
  const isFocused = createComputed(
    (get) => get(focusedWorkspace)?.id === ws.id
  );

  const classes = createComputed((get) =>
    get(clientMoved)
      ? [
          "base",
          get(isFocused) ? "focused" : "",
          get(hasClients) ? "" : "empty",
        ].filter(Boolean)
      : []
  );

  return (
    <button {...props} cssClasses={classes} onClicked={() => ws.focus()}>
      {num}
    </button>
  );
}

function WorkspaceList({ monitor }: { monitor: AstalHyprland.Monitor }) {
  const realWorkspaces = createBinding(hyprland, "workspaces").as((wss) =>
    wss.filter((ws) => ws.monitor?.id === monitor.id && ws.id > 0).sort((a, b) => a.id - b.id)
  );
  const workspaces = createComputed(get => {
    const wss = [];

    for (let i = 1; i <= 6; i++) {
      const existing = get(realWorkspaces).find(ws => ws.id === monitor.id * 6 + i);
      if (existing) {
        wss.push(existing);
      } else {
        wss.push(AstalHyprland.Workspace.dummy(monitor.id * 6 + i, monitor));
      }
    }

    return wss;
  })
  return (
    <box>
      <For each={workspaces}>
        {(ws, i) => (
          <WorkspaceButton
            ws={ws}
            num={i.peek() + 1}
          />
        )}
      </For>
    </box>
  );
}

export default function Workspaces({
  monitor,
}: {
  monitor: Accessor<AstalHyprland.Monitor | undefined>;
}) {
  return (
    <box class="workspaces">
      <With value={monitor}>
        {(monitor) => (monitor ? <WorkspaceList monitor={monitor} /> : null)}
      </With>
    </box>
  );
}

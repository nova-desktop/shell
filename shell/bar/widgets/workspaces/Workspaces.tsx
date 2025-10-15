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
import { range } from "../../../../lib/utils";

app.apply_css(style);

type ButtonProps = CCProps<Gtk.Button, Gtk.Button.ConstructorProps>;
type WorkspaceButtonProps = Partial<ButtonProps> & {
  ws: AstalHyprland.Workspace;
  num: number;
};

const hyprland = AstalHyprland.get_default();

const [moveCount, setMoveCount] = createState(0);
hyprland.connect("client-moved", () => {
  setMoveCount((last) => last + 1);
});

function WorkspaceButton({ ws, num, ...props }: WorkspaceButtonProps) {
  const classes = createComputed(
    [
      createBinding(hyprland, "focusedWorkspace"),
      createBinding(hyprland, "clients"),
      moveCount,
    ],
    (fws) =>
      [
        "base",
        fws?.id === ws.id ? "focused" : "",
        hyprland.get_workspace(ws.id)?.get_clients()?.length > 0 ? "" : "empty",
      ].filter(Boolean)
  );

  return (
    <button {...props} cssClasses={classes} onClicked={() => ws.focus()}>
      {num}
    </button>
  );
}

export default function Workspaces({ monitor }: { monitor: Accessor<number> }) {
  return (
    <box class="workspaces">
      <With value={monitor}>
        {(monitor) => (
          <box>
            <For each={createState(range(10, 1))[0]}>
              {(i) => (
                <WorkspaceButton
                  ws={AstalHyprland.Workspace.dummy(monitor * 6 + i, null)}
                  num={i}
                />
              )}
            </For>
          </box>
        )}
      </With>
    </box>
  );
}

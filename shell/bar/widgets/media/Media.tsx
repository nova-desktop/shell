import { createBinding, createComputed, With } from "ags";
import app from "ags/gtk4/app";
import Mpris from "gi://AstalMpris";
import style from "./Media.scss";

const mpris = Mpris.get_default();

app.apply_css(style);

function MediaActual({ player }: { player: Mpris.Player }) {
  const songLabel = createComputed(
    [createBinding(player, "artist"), createBinding(player, "title")],
    (artist, title) =>
      !artist && !title ? "Nothing is playing" : `${title} - ${artist}`
  );

  return (
    <box>
      <box spacing={8} class="media-buttons">
        <button class="base" onClicked={() => player.previous()}>
          <label label="󰒮" class="media-icon" />
        </button>
        <button class="base play" onClicked={() => player.play_pause()}>
          <label
            label={createBinding(player, "playbackStatus").as((s) =>
              s === Mpris.PlaybackStatus.PLAYING ? "󰏦" : "󰐍"
            )}
            class="media-icon"
          />
        </button>
        <button class="base" onClicked={() => player.next()}>
          <label label="󰒭" class="media-icon" />
        </button>
      </box>
      <box
        class="cover-art"
        css={createBinding(player, "coverArt").as((cover) => {
          if (!cover) {
            return `background-image: linear-gradient(0deg, #777, #777), linear-gradient(0deg, #333, #333);`;
          }
          return `background-image: linear-gradient(0deg, #777, #777), url('file://${cover}');`;
        })}
      >
        <label label={songLabel} class="media-label" />
      </box>
    </box>
  );
}

export default function Media() {
  const player = createBinding(mpris, "players").as(
    (players) => players.find((p) => p.busName.endsWith("playerctld"))!
  );

  return (
    <box class="media">
      <With value={player}>{(player) => <MediaActual player={player} />}</With>
    </box>
  );
}

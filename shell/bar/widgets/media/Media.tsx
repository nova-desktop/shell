import { Accessor, createState, createBinding, createComputed, With, For } from "ags";
import app from "ags/gtk4/app";
import Mpris from "gi://AstalMpris";
import style from "./Media.scss";

const mpris = Mpris.get_default();

app.apply_css(style);

type MediaVisualProps = {
  songLabel: Accessor<string>;
  coverArt: Accessor<string>;
  playbackStatus: Accessor<boolean>;
  previous: () => void;
  next: () => void;
  playPause: () => void;
};

function MediaVisual({
  songLabel,
  coverArt,
  next,
  playPause,
  previous,
  playbackStatus,
}: MediaVisualProps) {
  return (
    <box>
      <box spacing={8} class="media-buttons">
        <button class="base" onClicked={previous}>
          <label label="󰒮" class="media-icon" />
        </button>
        <button class="base play" onClicked={playPause}>
          <label
            label={playbackStatus.as((s) => (s ? "󰏦" : "󰐍"))}
            class="media-icon"
          />
        </button>
        <button class="base" onClicked={next}>
          <label label="󰒭" class="media-icon" />
        </button>
      </box>
      <box
        class="cover-art"
        css={coverArt.as((cover) => {
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

function MediaFake() {
  const [coverArt] = createState(false);
  const [playbackStatus] = createState(false);

  return <MediaVisual songLabel="Nothing is playing" coverArt={coverArt} next={() => {}} playPause={() => {}} previous={() => {}} playbackStatus={playbackStatus} />
}

function MediaActual({ player }: { player: Mpris.Player }) {
  const songLabel = createComputed(
    [createBinding(player, "artist"), createBinding(player, "title")],
    (artist, title) =>
      !artist && !title ? "Nothing is playing" : `${title} - ${artist}`
  );
  const coverArt = createBinding(player, "coverArt");
  const playbackStatus = createBinding(player, "playbackStatus").as((s) =>
    s === Mpris.PlaybackStatus.PLAYING
  );

  return <MediaVisual songLabel={songLabel} coverArt={coverArt} next={() => player.next()} playPause={() => player.play_pause()} previous={() => player.previous()} playbackStatus={playbackStatus} />
}

export default function Media() {
  const player = createBinding(mpris, "players").as(
    (players) => players.filter((p) => !p.busName.endsWith("playerctld"))
  );
  const hasPlayers = player.as(
    (players) => players.length !== 0
  );

  return (
    <box class="media">
      <For each={player}>
        {(player) =>
          <MediaActual player={player} />          
        }
      </For>
      <With value={hasPlayers}>{(has) => has ? null : <MediaFake />}</With>
    </box>
  );
}


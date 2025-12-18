import {
  Accessor,
  createState,
  createBinding,
  createComputed,
  With,
  For,
  createEffect,
  onCleanup,
  onMount,
} from "ags";
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
  const [coverArt] = createState("");
  const [playbackStatus] = createState(false);
  const [label] = createState("Nothing is playing");

  return (
    <MediaVisual
      songLabel={label}
      coverArt={coverArt}
      next={() => {}}
      playPause={() => {}}
      previous={() => {}}
      playbackStatus={playbackStatus}
    />
  );
}

function MediaActual({ player }: { player: Mpris.Player }) {
  const songLabel = createComputed(
    [createBinding(player, "artist"), createBinding(player, "title")],
    (artist, title) =>
      !artist && !title ? "Nothing is playing" : `${title} - ${artist}`
  );
  const coverArt = createBinding(player, "coverArt");
  const playbackStatus = createBinding(player, "playbackStatus").as(
    (s) => s === Mpris.PlaybackStatus.PLAYING
  );

  return (
    <MediaVisual
      songLabel={songLabel}
      coverArt={coverArt}
      next={() => player.next()}
      playPause={() => player.play_pause()}
      previous={() => player.previous()}
      playbackStatus={playbackStatus}
    />
  );
}
const players = createBinding(mpris, "players").as((players) =>
  players.filter((p) => !p.busName.endsWith("playerctld"))
);

export default function Media() {
  const [playbackChanged, setPlaybackChanged] = createState(0);
  createEffect(() => {
    players();
  });
  const playersSorted = createComputed((get) =>
    get(playbackChanged)
      ? get(players).sort(
          (a, b) =>
            Number(a?.playbackStatus === Mpris.PlaybackStatus.PLAYING) -
            Number(b?.playbackStatus === Mpris.PlaybackStatus.PLAYING)
        )
      : get(players)
  );
  const hasPlayers = players.as((players) => players.length !== 0);

  return (
    <box class="media">
      <With value={players}>
        {(players) =>
          hasPlayers.peek() ? <MediaActual player={players[0]} /> : null
        }
      </With>
      <With value={hasPlayers}>{(has) => (has ? null : <MediaFake />)}</With>
    </box>
  );
}

import { createBinding, createState } from "ags";
import Wp from "gi://AstalWp";

const audio = Wp.get_default()?.audio!;

type AudioState = {
  volume: number;
  mute: boolean;
  name: string;
};

function icon(speakers: AudioState) {
  const volume = speakers.volume * 100;

  if (speakers.mute) return "󰝟";
  if (volume >= 66) return "󰕾";
  if (volume >= 33) return "󰖀";
  return "󰕿";
}

const [audioState, setAudioState] = createState({
  volume: 0,
  mute: true,
  name: "",
});

function subEndpoint(endpoint: Wp.Endpoint) {
  const volumeSub = createBinding(endpoint, "volume");
  const volumeDispose = volumeSub.subscribe(() => {
    setAudioState((prev) => ({
      ...prev,
      volume: volumeSub.get(),
    }));
  });

  const muteSub = createBinding(endpoint, "mute");
  const muteDispose = muteSub.subscribe(() => {
    setAudioState((prev) => ({
      ...prev,
      mute: muteSub.get(),
    }));
  });

  const name = createBinding(endpoint, "description");
  const nameDispose = name.subscribe(() => {
    setAudioState((prev) => ({
      ...prev,
      name: name.get(),
    }));
  });

  return () => {
    volumeDispose();
    muteDispose();
    nameDispose();
  };
}

const defaultSpeaker = createBinding(audio, "defaultSpeaker");
let endpointDispose: (() => void) | null = null;

defaultSpeaker.subscribe(() => {
  if (endpointDispose !== null) {
    endpointDispose();
  }

  endpointDispose = subEndpoint(defaultSpeaker.get());
});

endpointDispose = subEndpoint(defaultSpeaker.get());

export default function Volume() {
  return (
    <box tooltipMarkup={audioState.as((state) => `${Math.round(state.volume * 100)}% - ${state.name}`)}>
      <label label={audioState.as(icon)} />
    </box>
  );
}

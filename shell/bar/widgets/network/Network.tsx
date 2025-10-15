import { createBinding, createComputed } from "ags";
import Network from "gi://AstalNetwork";

const network = Network.get_default();

const netInfo = createComputed(
  [
    createBinding(network, "primary"),
    createBinding(network, "wifi"),
    createBinding(network, "connectivity"),
  ],
  (primary, wifi, connectivity) => ({ primary, wifi, connectivity })
);

type NetworkInfo = {
  primary: Network.Primary;
  wifi: Network.Wifi;
  connectivity: Network.Connectivity;
};

function logo(network: NetworkInfo) {
  if (network.primary === Network.Primary.WIRED) {
    if (network.connectivity === Network.Connectivity.FULL) return "󰈁";
    if (network.connectivity === Network.Connectivity.LIMITED) return "󰈂";
    return "󰅖";
  } else if (network.primary === Network.Primary.WIFI) {
    if (network.connectivity === Network.Connectivity.FULL) {
      if (network.wifi.strength >= 80) return "󰤨";
      if (network.wifi.strength >= 60) return "󰤥";
      if (network.wifi.strength >= 40) return "󰤢";
      if (network.wifi.strength >= 20) return "󰤟";
      return "󰤯";
    }
    if (network.connectivity === Network.Connectivity.LIMITED) {
      if (network.wifi.strength >= 80) return "󰤩";
      if (network.wifi.strength >= 60) return "󰤦";
      if (network.wifi.strength >= 40) return "󰤣";
      if (network.wifi.strength >= 20) return "󰤠";
      return "󰤫";
    }
    return "󰤮";
  } else {
    return "󰅖";
  }
}

function tooltip(networkInfo: NetworkInfo) {
  return networkInfo.primary === Network.Primary.WIFI
    ? networkInfo.wifi.ssid
    : "Wired";
}

export default function NetworkStatus() {
  return (
    <box>
      <label
        tooltipMarkup={netInfo.as(tooltip)}
        label={netInfo.as(logo)}
        class="icon"
      />
    </box>
  );
}

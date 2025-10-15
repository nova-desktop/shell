import { createPoll } from "ags/time";

const time = createPoll("", 1000, 'date "+%a, %d.%m.%y | %H:%M:%S"');

export default function Clock() {
  return (
    <box>
      <label label={time} />
    </box>
  );
}

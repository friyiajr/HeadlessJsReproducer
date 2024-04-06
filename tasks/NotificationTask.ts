import { schedulePushNotification } from "../notifications";
import { useBLEStore } from "../state/BluetoothState";

module.exports = async (_: any) => {
  const pulses = useBLEStore.getState().pulses;
  schedulePushNotification(pulses);
};

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  AppRegistry,
} from "react-native";
import { requestPermissions } from "./state/BluetoothLeManagerPermission";
import {
  connectToPeripheral,
  startScanningForDevices,
  startStreamingData,
  useBLEStore,
} from "./state/BluetoothState";
import { usePushNotifications } from "./notifications";

AppRegistry.registerHeadlessTask("PulseCheck", () =>
  require("./tasks/NotificationTask")
);

export default function App() {
  const { schedulePushNotification } = usePushNotifications();
  const appState = useRef(AppState.currentState);

  const [displayPulse, setDisplayPulse] = useState(
    useBLEStore.getState().pulses
  );

  let unsub = useRef<() => void>();

  useEffect(() => {
    unsub.current = useBLEStore.subscribe((state) => {
      setDisplayPulse(state.pulses);
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        console.log("LEAVING");
        unsub.current?.();
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        unsub.current = useBLEStore.subscribe((state) => {
          setDisplayPulse(state.pulses);
        });
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const scanForDevices = async () => {
    const result = await requestPermissions();
    if (result) {
      startScanningForDevices();
    }
  };

  const connectToDevice = async () => {
    await connectToPeripheral(useBLEStore.getState().devices[0].id!);
    startStreamingData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.number}>{displayPulse}</Text>
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={scanForDevices}>
          <Text>Start Scanning</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={connectToDevice}>
          <Text>Connect To Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    fontSize: 200,
  },
  button: {
    height: 70,
    backgroundColor: "lightblue",
    marginBottom: 40,
    marginHorizontal: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

import { create } from "zustand";
import bleManager, { DeviceReference } from "./BluetoothLeManager";
import { Device } from "react-native-ble-plx";

interface BLEState {
  pulses: number;
  devices: DeviceReference[];
  connectedDevice: string;
  incrementPulse: (val: number) => void;
  addDevice: (device: DeviceReference) => void;
  setConnectedDevice: (deviceId: string) => void;
}

export const useBLEStore = create<BLEState>((set) => ({
  devices: [],
  pulses: 0,
  connectedDevice: "",
  incrementPulse: () => {
    set((state) => ({
      pulses: (state.pulses += 1),
    }));
  },
  addDevice: (device: DeviceReference) => {
    set((state) => ({
      devices: [...state.devices, device],
    }));
  },
  setConnectedDevice: (deviceId: string) => {
    set(() => ({
      connectedDevice: deviceId,
    }));
  },
}));

export const connectToPeripheral = async (deviceId: string) => {
  await bleManager.connectToPeripheral(deviceId);
  useBLEStore.getState().setConnectedDevice(deviceId);
};

export const startScanningForDevices = () => {
  bleManager.scanForPeripherals((device) => {
    if (device.name?.includes("Friyia") || device.name?.includes("Arduino")) {
      console.log("device", device);
      useBLEStore.getState().addDevice(device);
    }
  });
};

export const startStreamingData = () => {
  bleManager.startStreamingData((value) => {
    console.log("value", value);
    if (typeof value.payload === "string") {
      useBLEStore.getState().incrementPulse(Number(value.payload));
    }
  });
};

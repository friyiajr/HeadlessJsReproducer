import base64 from "react-native-base64";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

export interface DeviceReference {
  name?: string | null;
  id?: string;
}

const PULSE_SERVICE = "19b10000-e8f2-537e-4f6c-d104768a1214";
const PULSE_SERVICE_NOTIFY = "19b10001-e8f2-537e-4f6c-d104768a1216";

class BluetoothLeManager {
  bleManager: BleManager;
  device: Device | null;
  isListening = false;

  constructor() {
    this.bleManager = new BleManager();
    this.device = null;
  }

  scanForPeripherals = (
    onDeviceFound: (deviceSummary: DeviceReference) => void
  ) => {
    this.bleManager.startDeviceScan(null, null, (_, scannedDevice) => {
      onDeviceFound({
        id: scannedDevice?.id,
        name: scannedDevice?.localName ?? scannedDevice?.name,
      });
    });
  };

  stopScanningForPeripherals = () => {
    this.bleManager.stopDeviceScan();
  };

  connectToPeripheral = async (identifier: string) => {
    this.device = await this.bleManager.connectToDevice(identifier);
    await this.device?.discoverAllServicesAndCharacteristics();
  };

  onPulseRecieved = (
    error: BleError | null,
    charactaristic: Characteristic | null,
    emitter: (bleValue: { payload: string | BleError }) => void
  ) => {
    if (error) {
      emitter({ payload: "" });
    }
    const pulseValue = base64.decode(charactaristic?.value!);
    emitter({ payload: pulseValue });
  };

  startStreamingData = async (
    emitter: (bleValue: { payload: string | BleError }) => void
  ) => {
    if (!this.isListening) {
      this.isListening = true;
      this.device?.monitorCharacteristicForService(
        PULSE_SERVICE,
        PULSE_SERVICE_NOTIFY,
        (error, charactaristic) => {
          this.onPulseRecieved(error, charactaristic, emitter);
        }
      );
    }
  };
}

const manager = new BluetoothLeManager();

export default manager;

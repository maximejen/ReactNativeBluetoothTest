import React from "react";
import { BleError, BleManager, Characteristic, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { DevicesList } from "./DevicesList";
import storage from "../../storage/storage";

const BluetoothContext: React.Context<any> = React.createContext(null);

interface BluetoothContextProviderProps {
	children: JSX.Element | JSX.Element[];
}

export type DeviceIsConnectableFuncType = (device: Device) => boolean;
export type ConnectFuncType = (device: Device) => Promise<Device>;
export type DisconnectFuncType = (device: Device) => Promise<Device>;

export interface BleCtxValueType {
	manager: BleManager;
	connectToDevice: ConnectFuncType;
	devicesList: DevicesList;
	scannedDevicesList: DevicesList;
	disconnectFromDevice: DisconnectFuncType;
	deviceIsConnectable: DeviceIsConnectableFuncType;
}

const BluetoothContextProvider: React.FunctionComponent<BluetoothContextProviderProps> = ({ children }) => {
	const managerRef = React.useRef<BleManager>(new BleManager());

	const devicesList = React.useRef<DevicesList>(new DevicesList());
	const scannedDevicesList = React.useRef<DevicesList>(new DevicesList());

	// Adds the storage devices to the devicesList.
	React.useEffect(() => {
		storage
			.load({
				key: "devicesList",
			})
			.then((data: Device[]) => {
				data.forEach((device: Device) => {
					devicesList.current.addOrReplace(device);
				});
			})
			.catch((e) => {
				if (e.name !== "NotFoundError") console.log("Error loading data from storage :", e.message);
			});
	}, []);

	// Ensures the update of the devicesList in the AsyncStorage
	React.useEffect(() => {
		if (devicesList) {
			const onListChange = (list) => {
				storage.save({ key: "devicesList", data: list.devices }).catch((e) => {
					console.log("Error while syncing devicesList in storage :", e.message);
				});
			};
			devicesList.current.subscribeToListChange(onListChange);
			return () => {
				devicesList.current.unsubscribeToListChange(onListChange);
			};
		}
	}, [devicesList]);

	const deviceIsConnectable = React.useCallback<DeviceIsConnectableFuncType>((device: Device) => {
		if (!device) return false;
		return device.connect !== undefined && typeof device.connect === "function";
	}, []);

	const connectToDevice = React.useCallback<ConnectFuncType>(async (device: Device) => {
		if (!device) throw new Error("[connectToDevice]: invalid device.");
		const connectedDevice = await device.connect({
			autoConnect: false,
		});
		if (!connectedDevice) throw new Error("[connectToDevice]: Could not connect to device.");
		const connectedAndDiscoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
		if (!connectedAndDiscoveredDevice)
			throw new Error("[connectToDevice]: Could not discover Services and Characteristics.");
		// add the device connected with services and characteristics in the context data.
		devicesList.current.addOrReplace(connectedAndDiscoveredDevice);

		// Add Event Listener on disconnection to update the lists of devices and ensure it's up-to-date.
		connectedAndDiscoveredDevice.onDisconnected((error: BleError | null, updatedDevice: Device) => {
			console.log(`Device disconnected : ${updatedDevice.id} (${updatedDevice.name})`);
			if (error) {
				console.log(`Error : ${error.message}`);
			}
			devicesList.current.addOrReplace(connectedAndDiscoveredDevice);
		});

		return connectedAndDiscoveredDevice;
	}, []);

	const disconnectFromDevice = React.useCallback<DisconnectFuncType>(async (device: Device) => {
		if (!device) throw new Error("[disconnectToDevice]: invalid device.");
		const connectedDevice = await device.connect({
			autoConnect: false,
		});
		if (!connectedDevice) return device;
		return device.cancelConnection();
	}, []);

	return (
		<BluetoothContext.Provider
			value={{
				manager: managerRef.current,
				connectToDevice,
				devicesList: devicesList.current,
				scannedDevicesList: scannedDevicesList.current,
				disconnectFromDevice,
				deviceIsConnectable,
			}}
		>
			{children}
		</BluetoothContext.Provider>
	);
};

export default BluetoothContextProvider;

export const useBluetoothContext = () => {
	return React.useContext(BluetoothContext);
};

export const useBluetoothManager = () => {
	const bluetoothCtx = useBluetoothContext();

	return React.useMemo<BleManager | null>(() => {
		return bluetoothCtx?.manager ? bluetoothCtx.manager : null;
	}, [bluetoothCtx]);
};

export interface ICharacteristic {
	name: string;
	uuid: string;
	getValue: (characteristic: Characteristic) => any;
}

export interface IService {
	uuid: string;
	characteristics: ICharacteristic[];
}

export interface IBluetoothInterface {
	ledControl: IService;
}

export const bleServicesInfo: IBluetoothInterface = {
	ledControl: {
		uuid: "98294635-40dd-4094-a095-3464082ea944",
		characteristics: [
			{
				name: "pattern",
				uuid: "98294635-40dd-4094-a095-d866ad327621",
				getValue: (characteristic) => {
					if (characteristic.uuid !== bleServicesInfo.ledControl.characteristics[0].uuid) {
						return "Invalid characteristic";
					}
					const value = new Buffer(characteristic.value, "base64");
					console.log('Characteristic["pattern"] value :', value.toString(), characteristic.value);
					console.log('Characteristic["pattern"] int8 :', value.readInt8());
					return value.readInt8();
				},
			},
			{
				name: "brightness",
				uuid: "98294635-40dd-4094-a095-0242ac120002",
				getValue: (characteristic) => {
					if (characteristic.uuid !== bleServicesInfo.ledControl.characteristics[1].uuid) {
						return "Invalid characteristic";
					}
					console.log("Characteristic[\"brightness\"] base64 :", characteristic.value);
					const value = new Buffer(characteristic.value, "base64");
					console.log('Characteristic["brightness"] value :', value.toString(), characteristic.value);
					console.log('Characteristic["brightness"] int :', value.readInt8());
					return value.readInt8();
				},
			},
			{
				name: "fps",
				uuid: "98294635-40dd-4094-a095-0242ac120003",
				getValue: (characteristic) => {
					if (characteristic.uuid !== bleServicesInfo.ledControl.characteristics[2].uuid) {
						return "Invalid characteristic";
					}
					console.log("Characteristic[\"fps\"] base64 :", characteristic.value);
					const value = new Buffer(characteristic.value, "base64");
					console.log('Characteristic["fps"] value :', value.toString(), characteristic.value);
					console.log('Characteristic["fps"] int :', value.readInt8());
					return value.readInt8();
				},
			},
		],
	},
};

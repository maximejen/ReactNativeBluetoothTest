import React from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

const BluetoothContext: React.Context<any> = React.createContext(null);

interface BluetoothContextProviderProps {
	children: JSX.Element | JSX.Element[];
}

const BluetoothContextProvider: React.FunctionComponent<BluetoothContextProviderProps> = ({ children }) => {
	const managerRef = React.useRef<BleManager>(new BleManager());

	const [devices, setDevices] = React.useState<Device[]>([]);
	const devicesRef = React.useRef<Device[]>([]);

	React.useEffect(() => {
		console.log("Construct BluetoothContextProvider");
		return () => {
			console.log("Destroy BluetoothContextProvider");
		};
	}, []);

	const addOrReplaceDeviceInList = React.useCallback((device: Device) => {
		const devices = devicesRef.current;
		if (!device.id || (!device.name && !device.localName)) return devices;
		const deviceIdx = devices.findIndex((d) => d.id === device.id);
		let tmp = devices;
		if (deviceIdx === -1) tmp = devices.concat([device]);
		else tmp[deviceIdx] = device;
		setDevices(tmp);
		devicesRef.current = tmp;
		return tmp;
	}, []);

	const removeDeviceFromList = React.useCallback((device: Device) => {
		const devices = devicesRef.current;
		const deviceIdx = devices.findIndex((d) => d.id === device.id);
		let tmp = devices;
		if (deviceIdx !== -1) {
			tmp = devices.filter((d) => d.id !== device.id);
			setDevices(tmp);
			devicesRef.current;
		}
		return tmp;
	}, []);

	const getDevice = React.useCallback((deviceId) => {
		return devicesRef.current.find((d) => d.id === deviceId);
	}, []);

	const connectToDevice = React.useCallback(async (deviceId) => {
		const device = getDevice(deviceId);
		if (!device) throw new Error("[connectToDevice]: Cannot find device.");
		const connectedDevice = await device.connect({
			autoConnect: false,
		});
		if (!connectedDevice) throw new Error("[connectToDevice]: Could not connect to device.");
		const connectedAndDiscoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
		if (!connectedAndDiscoveredDevice)
			throw new Error("[connectToDevice]: Could not discover Services and Characteristics.");
		// add the device connected with services and characteristics in the context data.
		addOrReplaceDeviceInList(connectedAndDiscoveredDevice);
		return connectedAndDiscoveredDevice;
	}, []);

	return (
		<BluetoothContext.Provider
			value={{
				manager: managerRef.current,
				devices,
				addOrReplaceDeviceInList,
				removeDeviceFromList,
				getDevice,
				connectToDevice,
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

export const bleServicesInfo = {
	ledControl: {
		uuid: "176f60d7-5506-4b60-a4d3-3464082ea944",
		characteristics: {
			pattern: {
				uuid: "98294635-40dd-4094-a095-d866ad327621",
				getValue: (characteristic) => {
					if (characteristic.uuid !== bleServicesInfo.ledControl.characteristics.pattern.uuid) {
						return "Invalid characteristic";
					}
					const value = new Buffer(characteristic.value, "base64");
					console.log('Characteristic["pattern"] value :', value.readInt8());
					return value.readInt8();
				},
			},
		},
	},
};

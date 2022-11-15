import React from "react";
import { Device } from "react-native-ble-plx";
import { BleCtxValueType, useBluetoothContext } from "../bluetooth/context/BluetoothContextProvider";

const useIsDeviceConnected = (device?: Device, onConnected?: () => void, onDisconnected?: () => void) => {
	const bleCtx: BleCtxValueType = useBluetoothContext();

	const [isConnected, setIsConnected] = React.useState<undefined | boolean>(undefined);

	React.useEffect(() => {
		if (device) {
			setIsConnected(undefined);
			if (device.isConnected) {
				device.isConnected().then((connected) => {
					setIsConnected(connected);
					onConnected && onConnected();
				});
				device?.onDisconnected((error, device) => {
					setIsConnected(false);
					onDisconnected && onDisconnected();
				});
			} else {
				setIsConnected(false);
			}
		}
	}, [device]);

	const isConnectable = React.useMemo(() => {
		if (bleCtx && device) {
			return bleCtx.deviceIsConnectable(device);
		}
		return false;
	}, [bleCtx, device]);

	return [isConnected, isConnectable];
};

export default useIsDeviceConnected;

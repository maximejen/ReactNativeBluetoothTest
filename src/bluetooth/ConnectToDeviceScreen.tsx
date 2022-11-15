import React from "react";
import { StyleSheet, View } from "react-native";
import { Device, DeviceId } from "react-native-ble-plx";
import { Button, Text } from "@rneui/base";
import { BleCtxValueType, bleServicesInfo, useBluetoothContext } from "./context/BluetoothContextProvider";
import { LinearProgress } from "@rneui/themed";
import { Buffer } from "buffer";

interface Props {
	navigation: any;
	route: {
		params: {
			deviceId: DeviceId;
		};
	};
}

const ConnectToDeviceScreen: React.FunctionComponent<Props> = ({ route, navigation, ...props }) => {
	const bluetoothCtx: BleCtxValueType = useBluetoothContext() || {};

	const { connectToDevice } = bluetoothCtx;

	const deviceId = React.useMemo(() => {
		return route?.params?.deviceId;
	}, [route]);

	const [progress, setProgress] = React.useState<number>(0);
	const [error, setError] = React.useState<string | undefined>(undefined);

	const connect = React.useCallback(
		async (deviceId: string) => {
			setProgress(0.5);
			const device =
				bluetoothCtx.scannedDevicesList.getDevice(deviceId) || bluetoothCtx.devicesList.getDevice(deviceId);
			const connectedDevice: Device = await connectToDevice(device);
			if (connectedDevice) {
				connectedDevice.isConnected().then((connected) => {
					if (connected === true) {
						setProgress(1);
						bluetoothCtx.scannedDevicesList.removeDevice(connectedDevice);
						connectedDevice
							.readCharacteristicForService(
								bleServicesInfo.ledControl.uuid,
								bleServicesInfo.ledControl.characteristics[0].uuid
							)
							.then((characteristic) => {
								bleServicesInfo.ledControl.characteristics[0].getValue(characteristic);
							});
						connectedDevice
							.readCharacteristicForService(
								bleServicesInfo.ledControl.uuid,
								bleServicesInfo.ledControl.characteristics[1].uuid
							)
							.then((characteristic) => {
								bleServicesInfo.ledControl.characteristics[1].getValue(characteristic);
							});
					} else {
						setProgress(0);
					}
				});
			}
		},
		[bluetoothCtx]
	);

	React.useEffect(() => {
		if (deviceId) {
			connect(deviceId)
				.then((r) => {})
				.catch((e) => {
					setProgress(0);
					if (e) setError(e.message);
				});
		}
	}, [deviceId]);

	if (error) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorMessage}>{error}</Text>
			</View>
		);
	}

	return (
		<View {...props}>
			<View style={styles.progressContainer}>
				<LinearProgress value={progress} variant={"determinate"} style={styles.progress} />
			</View>
			<View style={styles.container}>
				{progress === 0 && <Text>{"Could no connect to Device..."}</Text>}
				{progress === 0.5 && <Text>{"Connecting to Device..."}</Text>}
				{progress === 1 && <Text>{"Connected"}</Text>}
			</View>
		</View>
	);
};

export default ConnectToDeviceScreen;

const styles = StyleSheet.create({
	progress: {
		marginTop: 10,
	},
	progressContainer: {
		marginHorizontal: 10,
	},
	errorMessage: {
		fontSize: 25,
		color: "red",
	},
	container: {
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
	},
});

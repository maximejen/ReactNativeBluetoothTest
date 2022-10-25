import React from "react";
import { StyleSheet, View } from "react-native";
import { Device, DeviceId } from "react-native-ble-plx";
import { Text } from "@rneui/base";
import { bleServicesInfo, useBluetoothContext } from "./context/BluetoothContextProvider";
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
	const bluetoothCtx = useBluetoothContext() || {};

	const { connectToDevice } = bluetoothCtx;

	const deviceId = React.useMemo(() => {
		return route?.params?.deviceId;
	}, [route]);

	const [progress, setProgress] = React.useState<number>(0);
	const [error, setError] = React.useState<string | undefined>(undefined);

	const connect = React.useCallback(async (deviceId) => {
		setProgress(0.5);
		const connectedDevice: Device = await connectToDevice(deviceId);
		if (connectedDevice) {
			connectedDevice.isConnected().then((connected) => {
				if (connected === true) {
					setProgress(1);
					connectedDevice
						.readCharacteristicForService(
							bleServicesInfo.ledControl.uuid,
							bleServicesInfo.ledControl.characteristics.pattern.uuid
						)
						.then((characteristic) => {
							bleServicesInfo.ledControl.characteristics.pattern.getValue(characteristic);
						});
				} else {
					setProgress(0);
				}
			});
		}
	}, []);

	React.useEffect(() => {
		if (deviceId) {
			try {
				connect(deviceId).then((r) => {});
			} catch (e) {
				setProgress(0);
				if (e) setError(e.message);
			}
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
			{/*{progress === 1 && (*/}
			{/*  <Button*/}
			{/*    title={"Set Pattern to random value"}*/}
			{/*    onPress={() => {*/}
			{/*      if (isDeviceComplete && device) {*/}
			{/*        device.isConnected().then((connected) => {*/}
			{/*          console.log("device is connected :", connected);*/}
			{/*          if (connected) {*/}
			{/*            const val = Math.floor(Math.random() * 10);*/}
			{/*            console.log("value to send : ", val);*/}
			{/*            const newValue = new Buffer("" + val).toString("base64");*/}
			{/*            device.writeCharacteristicWithoutResponseForService(*/}
			{/*              "176f60d7-5506-4b60-a4d3-3464082ea944",*/}
			{/*              "98294635-40dd-4094-a095-d866ad327621",*/}
			{/*              newValue*/}
			{/*            );*/}
			{/*          }*/}
			{/*        });*/}
			{/*      }*/}
			{/*    }}*/}
			{/*  />*/}
			{/*)}*/}
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

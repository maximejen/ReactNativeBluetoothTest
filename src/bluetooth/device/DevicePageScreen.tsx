import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { calcWidth } from "../../helpers/deviceResponsiveHelper";
import BaseButton from "../../components/BaseButton";
import { BleCtxValueType, bleServicesInfo, useBluetoothContext } from "../context/BluetoothContextProvider";
import { Device, DeviceId } from "react-native-ble-plx";
import useIsDeviceConnected from "../../helpers/useIsDeviceConnected";
import { Buffer } from "buffer";
import { Button } from "@rneui/base";
import DeviceOptions from "./DeviceOptions";

interface Props {
	navigation: any;
	route: {
		params: {
			deviceId: DeviceId;
		};
	};
}

const DevicePageScreen: React.FunctionComponent<Props> = ({ route, navigation, ...props }) => {
	const bleCtx: BleCtxValueType = useBluetoothContext() || {};

	const deviceId = React.useMemo(() => {
		return route?.params?.deviceId;
	}, [route]);

	const [device, setDevice] = React.useState<Device | undefined>(undefined);

	React.useEffect(() => {
		if (bleCtx) return setDevice(bleCtx.devicesList.getDevice(deviceId));
	}, [bleCtx, deviceId]);

	React.useEffect(() => {
		return navigation.addListener("focus", () => {
			if (bleCtx) setDevice(bleCtx.devicesList.getDevice(deviceId));
		});
	}, [navigation, bleCtx]);

	const [isConnected, isConnectable] = useIsDeviceConnected(device);

	// TODO : Show devices info
	// TODO : Change the connect / disconnect button based on the information in the device.
	// TODO : Try to connect to the device if not connected by default
	// TODO : If connected, show components to change the values of the Device (Brightness, Pattern (select), ...)

	return (
		<ScrollView style={styles.mainView} {...props}>
			{isConnectable && isConnected !== true && (
				<BaseButton
					style={styles.button}
					loading={isConnected === undefined}
					title={"Connect to device"}
					onPress={() => {
						navigation.navigate("ConnectToDevice", {
							deviceId: device.id,
						});
					}}
				/>
			)}
			{isConnected === true && (
				<>
					<DeviceOptions device={device} />
					<BaseButton
						style={styles.button}
						title={"Disconnect from device"}
						onPress={() => {
							if (bleCtx && device) {
								bleCtx.disconnectFromDevice(device).then((device) => {
									console.log(`Device ${device.id} (${device.name}) manually disconnected.`);
								});
							}
						}}
					/>
				</>
			)}
			<BaseButton
				style={styles.button}
				color={"error"}
				type={"outline"}
				title={"Forget device"}
				onPress={() => {
					if (bleCtx && device) {
						Alert.alert(`Forget device "${device.name}" ?`, `If you confirm, the device will be reset.`, [
							{
								text: "Cancel",
								onPress: () => {},
								style: "cancel",
							},
							{
								text: "Confirm",
								onPress: () => {
									bleCtx.devicesList.removeDevice(device);
									navigation.goBack();
								},
							},
						]);
					}
				}}
			/>
		</ScrollView>
	);
};

export default DevicePageScreen;

const styles = StyleSheet.create({
	mainView: {
		paddingTop: calcWidth(3),
	},
	button: {
		marginTop: calcWidth(3),
	},
});

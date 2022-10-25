import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useBluetoothContext, useBluetoothManager } from "../context/BluetoothContextProvider";
import { ListItem } from "@rneui/themed";
import ScannedDevice from "./ScannedDevice";

interface ScanDevicesScreenProps {
	navigation: any;
}

const ScanDevicesScreen: React.FunctionComponent<ScanDevicesScreenProps> = ({ navigation, ...props }) => {
	const bleCtx = useBluetoothContext() || {};
	const manager = useBluetoothManager();

	const { devices, addOrReplaceDeviceInList } = bleCtx;

	const [isScanning, setIsScanning] = React.useState<boolean>(false);

	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const scanDevices = React.useCallback(
		(milliseconds = 10000) => {
			if (manager && bleCtx && isScanning === false) {
				setIsScanning(true);
				manager.startDeviceScan(null, null, (error, scannedDevice) => {
					if (error) throw new Error(error.message);
					addOrReplaceDeviceInList(scannedDevice);
				});
				setRefreshing(false);
				if (timeoutRef.current !== null) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}
				timeoutRef.current = setTimeout(() => {
					stopScanning();
				}, milliseconds);
			}
		},
		[manager, bleCtx, isScanning]
	);

	const stopScanning = React.useCallback(() => {
		setIsScanning(false);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		manager.stopDeviceScan();
	}, []);

	React.useEffect(() => {
		scanDevices();
	}, [manager]);

	const [refreshing, setRefreshing] = React.useState<boolean>(false);

	const onRefresh = React.useCallback(() => {
		stopScanning();
		setRefreshing(true);
		scanDevices();
	}, []);

	React.useEffect(() => {
		return navigation.addListener("focus", () => {
			stopScanning();
			setRefreshing(true);
			scanDevices();
		});
	}, [navigation, isScanning]);

	return (
		<>
			<ScrollView
				style={styles.container}
				{...props}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			>
				{devices.map((device) => {
					if (!device.name && !device.localName) return null;
					return (
						<ScannedDevice
							key={device.id}
							device={device}
							onPress={() => {
								stopScanning();
								navigation.navigate("ConnectToDevice", {
									deviceId: device.id,
								});
							}}
							onDisconnected={(error, device) => {
								console.log(`Device[${device.id}, ${device.name}] disconnected`);
								if (error !== null) console.log("Error :", error.message);
								addOrReplaceDeviceInList(device);
							}}
						/>
					);
				})}
				{isScanning === true && (
					<ListItem style={styles.loader}>
						<ListItem.Subtitle>{"Finding Bluetooth® devices around..."}</ListItem.Subtitle>
						<ActivityIndicator size={"small"} />
					</ListItem>
				)}
				{isScanning === false && (
					<ListItem style={styles.loader}>
						<ListItem.Content style={styles.finishedScanMessage}>
							<ListItem.Title>{"List of Bluetooth® devices found"}</ListItem.Title>
							<ListItem.Subtitle>{"Scroll down to refresh."}</ListItem.Subtitle>
						</ListItem.Content>
					</ListItem>
				)}
			</ScrollView>
			<StatusBar style={"auto"} />
		</>
	);
};

export default ScanDevicesScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	subtitle: {
		color: "black",
	},
	loader: {
		alignItems: "center",
		justifyContent: "center",
	},
	finishedScanMessage: {
		alignItems: "center",
		justifyContent: "center",
	}
});

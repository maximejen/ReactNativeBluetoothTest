import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { BleCtxValueType, bleServicesInfo, useBluetoothContext } from "../context/BluetoothContextProvider";
import { Device } from "react-native-ble-plx";
import DeviceItem from "../../components/DeviceItem";
import { calcWidth } from "../../helpers/deviceResponsiveHelper";
import { ListItem } from "@rneui/themed";
import { DevicesList } from "../context/DevicesList";

interface Props {
	navigation: any;
}

const ListDevicesScreen: React.FunctionComponent<Props> = ({ navigation, ...props }) => {
	const bleCtx: BleCtxValueType = useBluetoothContext() || {};

	const [devices, setDevices] = React.useState<Device[]>([]);
	const [scannedDevices, setScannedDevices] = React.useState<Device[]>([]);
	const [refreshing, setRefreshing] = React.useState<boolean>(false);

	// Start scan and show devices in the cache.
	React.useEffect(() => {
		if (bleCtx) {
			bleCtx.manager.onStateChange((state) => {
				if (state === "PoweredOn") {
					scanDevices();
				}
			});
			// Load the list of devices in the cache
			setDevices(bleCtx.devicesList.devices);
			const onListChange = (list: DevicesList) => {
				setDevices(list.devices);
			};
			// Syncs the scannedDevicesList in the BleCtx with the local one.
			const onScannedListChange = (list) => {
				setScannedDevices(list.devices);
			};
			bleCtx.devicesList.subscribeToListChange(onListChange);
			bleCtx.scannedDevicesList.subscribeToListChange(onScannedListChange);
			return () => {
				bleCtx.devicesList.unsubscribeToListChange(onListChange);
				bleCtx.scannedDevicesList.unsubscribeToListChange(onScannedListChange);
			};
		}
	}, [bleCtx]);

	// handles scan of the non previously connected devices.
	const [isScanning, setIsScanning] = React.useState<boolean>(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const scanDevices = React.useCallback(
		(milliseconds = 10000) => {
			if (bleCtx && isScanning === false) {
				const manager = bleCtx.manager;
				manager.state().then((state) => {
					if (state !== "PoweredOn") return;
					setIsScanning(true);
					manager.startDeviceScan([bleServicesInfo.ledControl.uuid], null, (error, scannedDevice) => {
						if (error) throw new Error(error.message);

						// if the scannedDevice is already in the cache, we update the normal list, otherwise it goes in the scannedDevices list.
						if (bleCtx.devicesList.getDevice(scannedDevice.id) !== undefined) {
							bleCtx.devicesList.addOrReplace(scannedDevice);
						} else {
							bleCtx.scannedDevicesList.addOrReplace(scannedDevice);
						}
					});
					setRefreshing(false);
					if (timeoutRef.current !== null) {
						clearTimeout(timeoutRef.current);
						timeoutRef.current = null;
					}
					timeoutRef.current = setTimeout(() => {
						stopScanning();
					}, milliseconds);
				});
			}
		},
		[bleCtx, isScanning]
	);

	const stopScanning = React.useCallback(() => {
		setIsScanning(false);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		bleCtx.manager.stopDeviceScan();
	}, [bleCtx]);

	const onRefresh = React.useCallback(() => {
		if (bleCtx) {
			stopScanning();
			setRefreshing(true);
			scanDevices();
			setDevices(bleCtx.devicesList.devices);
		}
	}, [bleCtx]);

	// on focus of the screen
	React.useEffect(() => {
		return navigation.addListener("focus", () => {
			onRefresh();
		});
	}, [navigation]);

	return (
		<ScrollView
			style={styles.container}
			{...props}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
		>
			{devices.map((device) => {
				if (!device.name && !device.localName) return null;
				return (
					<DeviceItem
						key={device.id}
						device={device}
						onPress={() => {
							navigation.navigate("DevicePage", {
								deviceId: device.id,
							});
						}}
					>
						<ListItem.Chevron type={"material"} name={"info-outline"} size={18} />
					</DeviceItem>
				);
			})}
			{isScanning === true && (
				<ListItem style={styles.loaderMessage}>
					<ListItem.Title>{"Finding Bluetooth® devices around..."}</ListItem.Title>
					<ActivityIndicator size={"small"} />
				</ListItem>
			)}
			{isScanning === false && (
				<ListItem style={styles.loaderMessage}>
					<ListItem.Content>
						<ListItem.Title>{"List of Bluetooth® devices found"}</ListItem.Title>
						<ListItem.Subtitle>{"Scroll down to refresh."}</ListItem.Subtitle>
					</ListItem.Content>
				</ListItem>
			)}
			{scannedDevices.map((device, index) => {
				if (!device.name && !device.localName) return null;
				return (
					<DeviceItem
						key={device.id}
						device={device}
						topDivider={index === 0}
						onPress={() => {
							navigation.navigate("ConnectToDevice", {
								deviceId: device.id,
							});
						}}
					>
						<ListItem.Chevron type={"material"} name={"info-outline"} size={18} />
					</DeviceItem>
				);
			})}
			{isScanning === false && scannedDevices.length === 0 && (
				<ListItem style={styles.noDeviceFoundMessage}>
					<ListItem.Subtitle style={styles.noDeviceFoundMessage}>{"No devices found"}</ListItem.Subtitle>
				</ListItem>
			)}
		</ScrollView>
	);
};

export default ListDevicesScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	button: {
		marginTop: calcWidth(3),
	},
	subtitle: {
		color: "black",
	},
	loaderMessage: {
		alignItems: "flex-start",
		justifyContent: "flex-start",
	},
	noDeviceFoundMessage: {
		width: "100%",
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});

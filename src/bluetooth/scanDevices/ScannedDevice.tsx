import React from "react";
import { BleError, Device } from "react-native-ble-plx";
import { ListItem } from "@rneui/themed";
import { Badge } from "@rneui/base";
import { ActivityIndicator, StyleSheet, TouchableHighlight, View } from "react-native";

interface Props {
	device: Device;
	onPress?: () => void | undefined;
	onDisconnected?: (error: BleError, device: Device) => void | undefined;
}

const ScannedDevice: React.FunctionComponent<Props> = ({ device, onPress, onDisconnected, ...props }) => {
	const [isConnected, setIsConnected] = React.useState<undefined | boolean>(undefined);

	React.useEffect(() => {
		if (device) {
			setIsConnected(undefined);
			console.log(device.name, device.rssi);
			device.isConnected().then((connected) => {
				setIsConnected(connected);
			});
			device.onDisconnected((error, device) => {
				setIsConnected(false);
				onDisconnected && onDisconnected(error, device);
			});
		}
	}, [device]);

	if (!device) return null;

	const primaryLabel = device.name ? device.name : device.localName;
	const secondaryLabel = device.localName && device.localName !== device.name ? device.localName : undefined;

	const contentJSX = (
		<ListItem bottomDivider>
			<Badge status={device.isConnectable ? "success" : !device.rssi ? "error" : "warning"} />
			<ListItem.Content>
				<ListItem.Title style={styles.primaryLabel}>{primaryLabel}</ListItem.Title>
				{secondaryLabel && <ListItem.Subtitle style={styles.secondaryLabel}>{secondaryLabel}</ListItem.Subtitle>}
			</ListItem.Content>
			<View style={styles.badgesContainer}>
				{isConnected === undefined && <ActivityIndicator size={"small"} />}
				{isConnected !== undefined && (
					<Badge
						status={isConnected === true ? "success" : "error"}
						value={`${isConnected === true ? "C" : "Dis"}onnected`}
					/>
				)}
			</View>
			<ListItem.Chevron
				type={"material"}
				name={isConnected === true ? "info-outline" : device.rssi !== null ? "chevron-right" : "close"}
				size={18}
			/>
		</ListItem>
	);

	if (device.rssi === null) return contentJSX;

	return (
		<TouchableHighlight
			onPress={() => {
				console.log(device.id, device.name, device.localName);
				if (device.rssi !== null) onPress && onPress();
			}}
		>
			{contentJSX}
		</TouchableHighlight>
	);
};

export default ScannedDevice;

const styles = StyleSheet.create({
	badgesContainer: {
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "center",
		flexDirection: "column",
	},
	primaryLabel: {
		fontSize: 18,
		fontWeight: "500",
	},
	secondaryLabel: {
		fontSize: 13,
		fontWeight: "400",
	},
});

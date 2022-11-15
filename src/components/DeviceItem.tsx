import React from "react";
import { BleError, Device } from "react-native-ble-plx";
import { ListItem, ListItemProps } from "@rneui/themed";
import { Badge } from "@rneui/base";
import { ActivityIndicator, StyleSheet, TouchableHighlight, View } from "react-native";
import useIsDeviceConnected from "../helpers/useIsDeviceConnected";

interface Props extends ListItemProps {
	device: Device;
	onPress?: () => void | undefined;
	onDisconnected?: (error: BleError, device: Device) => void | undefined;
	showAvailability?: boolean;
	children?: JSX.Element | JSX.Element[];
}

const DeviceItem: React.FunctionComponent<Props> = ({
	device,
	onPress,
	onDisconnected,
	showAvailability = true,
	children,
	...props
}) => {
	const [isConnected] = useIsDeviceConnected(device);

	if (!device) return null;

	const primaryLabel = device.name ? device.name : device.localName;
	const secondaryLabel = device.localName && device.localName !== device.name ? device.localName : undefined;

	const contentJSX = (
		<ListItem bottomDivider {...props}>
			{showAvailability && <Badge status={device.isConnectable ? "success" : "warning"} />}
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
			{children}
		</ListItem>
	);

	// if (device.rssi === null) return contentJSX;

	return (
		<TouchableHighlight
			onPress={() => {
				onPress && onPress();
			}}
		>
			{contentJSX}
		</TouchableHighlight>
	);
};

export default DeviceItem;

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

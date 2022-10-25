import React from "react";
import { View } from "react-native";
import { bleServicesInfo, useBluetoothManager } from "./context/BluetoothContextProvider";
import { Button } from "@rneui/base";

interface Props {
	navigation: any;
}

const ListDevicesScreen: React.FunctionComponent<Props> = ({ navigation, ...props }) => {
	const manager = useBluetoothManager();

	React.useEffect(() => {
		if (manager) {
			manager.connectedDevices([bleServicesInfo.ledControl.uuid]).then((connectedDevices) => {
				connectedDevices.forEach((device) => {
					console.log(device.name, device.localName, device.id);
				});
			});
		}
	}, [manager]);

	return (
		<View>
			<Button
				title={"Go to scan Devices"}
				onPress={() => {
					navigation.navigate("ScanDevices");
				}}
			/>
		</View>
	);
};

export default ListDevicesScreen;

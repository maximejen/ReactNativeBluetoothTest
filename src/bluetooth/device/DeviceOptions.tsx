import React from "react";
import { Device } from "react-native-ble-plx";
import { View } from "react-native";
import { Buffer } from "buffer";
import { bleServicesInfo } from "../context/BluetoothContextProvider";
import BaseButton from "../../components/BaseButton";
import { Input } from "@rneui/base";
import BleInput from "../../components/BleInput";

interface Props {
	device: Device;
}

const DeviceOptions: React.FunctionComponent<Props> = ({ device, ...props }) => {
	if (!device) return null;
	return (
		<View>
			<BleInput
				label={"Pattern"}
				type={"number"}
				device={device}
				serviceUUID={bleServicesInfo.ledControl.uuid}
				characteristicUUID={bleServicesInfo.ledControl.characteristics[0].uuid}
			/>
			<BleInput
				label={"Brightness"}
				type={"number"}
				device={device}
				serviceUUID={bleServicesInfo.ledControl.uuid}
				characteristicUUID={bleServicesInfo.ledControl.characteristics[1].uuid}
			/>
			<BaseButton
				title={"Set Pattern to random value"}
				onPress={() => {
					if (device) {
						device.isConnected().then((connected) => {
							console.log("device is connected :", connected);
							if (connected) {
								const val = Math.floor(Math.random() * 10);
								console.log("value to send : ", val);
								const newValue = new Buffer("" + val).toString("base64");
								device.writeCharacteristicWithoutResponseForService(
									bleServicesInfo.ledControl.uuid,
									bleServicesInfo.ledControl.characteristics[0].uuid,
									newValue
								);
							}
						});
					}
				}}
			/>
		</View>
	);
};

export default DeviceOptions;

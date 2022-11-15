import React from "react";
import { Input, InputProps } from "@rneui/base";
import {
	BleCtxValueType,
	bleServicesInfo,
	ICharacteristic,
	IService,
	useBluetoothContext,
} from "../bluetooth/context/BluetoothContextProvider";
import { Characteristic, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

interface Props extends InputProps {
	device: Device;
	serviceUUID: string;
	characteristicUUID: string;
	type?: "number" | "text";
}

const BleInput: React.FunctionComponent<Props> = React.forwardRef(
	({ type = "text", device, serviceUUID, characteristicUUID, ...props }, ref) => {
		const bleCtx: BleCtxValueType = useBluetoothContext();

		const [value, setValue] = React.useState<string | undefined>(undefined);
		const [characteristic, setCharacteristic] = React.useState<Characteristic | undefined>(undefined);
		const [error, setError] = React.useState<string | undefined>(undefined);

		const localService = React.useMemo<IService>(() => {
			return Object.values(bleServicesInfo).find((e) => e.uuid === serviceUUID);
		}, [serviceUUID]);
		const localCharacteristic = React.useMemo<ICharacteristic>(() => {
			return localService.characteristics.find((e) => e.uuid === characteristicUUID);
		}, [localService, characteristicUUID]);

		React.useEffect(() => {
			if (bleCtx && device) {
				device
					.readCharacteristicForService(serviceUUID, characteristicUUID)
					.then((characteristic) => {
						setCharacteristic(characteristic);
						setValue("" + localCharacteristic.getValue(characteristic));
					})
					.catch((e) => {
						setError(e.message);
					});
			}
		}, [bleCtx, device, serviceUUID, characteristicUUID, localCharacteristic]);

		const writeValueInCharacteristic = React.useCallback(
			(value: any) => {
				if (characteristic && value !== undefined) {
					let newValue64: string;
					if (type === "number") {
						const buff: Buffer = new Buffer(1);
						buff.writeUInt8(value, 0);
						newValue64 = buff.toString("base64");
					} else {
						const buff: Buffer = new Buffer("" + value);
						newValue64 = buff.toString("base64");
					}
					characteristic.writeWithoutResponse(newValue64);
				}
			},
			[characteristic]
		);

		// @ts-ignore
		return (
			<Input
				ref={ref}
				value={value}
				errorMessage={error}
				keyboardType={type === "number" ? "number-pad" : "default"}
				onChangeText={(value) => {
					setValue(value);
				}}
				onBlur={() => {
					if (value === "") setValue("0");
					writeValueInCharacteristic(value === "" ? "0" : value);
				}}
				{...props}
			/>
		);
	}
);

export default BleInput;

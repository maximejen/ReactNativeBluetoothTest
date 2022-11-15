import { Device } from "react-native-ble-plx";

type ListChangeCallbackType = (list: DevicesList) => void;

export class DevicesList {
	_list: Device[] = [];
	_onListChange: ListChangeCallbackType[] = [];

	constructor(devicesList: Device[] = []) {
		this._list = devicesList;

		this._onListChange = [];
	}

	get devices() {
		return this._list;
	}

	set devices(list) {
		this._list = list;
		this._dispatchListChanged();
	}

	addOrReplace(device: Device) {
		if (!device.id || (!device.name && !device.localName)) return this.devices;
		const deviceIdx = this.devices.findIndex((d) => d.id === device.id);
		let tmp = this.devices;
		if (deviceIdx === -1) tmp = this.devices.concat([device]);
		else tmp[deviceIdx] = device;
		this.devices = tmp;
		return tmp;
	}

	removeDevice(device: Device) {
		const deviceIdx = this.devices.findIndex((d) => d.id === device.id);
		let tmp = this.devices;
		if (deviceIdx !== -1) {
			tmp = this.devices.filter((d) => d.id !== device.id);
			this.devices = tmp;
		}
		return tmp;
	}

	getDevice(deviceId: string) {
		return this.devices.find((d) => d.id === deviceId);
	}

	subscribeToListChange(callback: ListChangeCallbackType) {
		this._onListChange.push(callback);
	}

	unsubscribeToListChange(callback: ListChangeCallbackType) {
		let index = this._onListChange.indexOf(callback);
		if (index !== -1) this._onListChange.splice(index, 1);
	}

	_dispatchListChanged() {
		this._onListChange.forEach((callback) => callback(this));
	}
}

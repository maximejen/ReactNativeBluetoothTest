import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import ScanDevicesScreen from "./src/bluetooth/scanDevices/ScanDevicesScreen";
import BluetoothContextProvider from "./src/bluetooth/context/BluetoothContextProvider";
import { createTheme, ThemeProvider } from "@rneui/themed";
import ConnectToDeviceScreen from "./src/bluetooth/ConnectToDeviceScreen";
import ListDevicesScreen from "./src/bluetooth/ListDevicesScreen";

const theme = createTheme({
	components: {
		Button: {},
		ListItemTitle: {
			color: "black",
		},
	},
});

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<BluetoothContextProvider>
			<ThemeProvider theme={theme}>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="ListDevices">
						<Stack.Group>
							<Stack.Screen name="ListDevices" component={ListDevicesScreen} />
							<Stack.Screen name="ScanDevices" component={ScanDevicesScreen} />
						</Stack.Group>
						<Stack.Group screenOptions={{ presentation: "modal" }}>
							<Stack.Screen
								name="ConnectToDevice"
								component={ConnectToDeviceScreen}
								options={{ title: "Connect..." }}
							/>
						</Stack.Group>
					</Stack.Navigator>
				</NavigationContainer>
				<StatusBar style={"auto"} />
			</ThemeProvider>
		</BluetoothContextProvider>
	);
}

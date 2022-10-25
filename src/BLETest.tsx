import React from "react";
import { BleManager } from "react-native-ble-plx";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Buffer } from "buffer";

interface BLETestProps {}

const BLETest: React.FunctionComponent<BLETestProps> = ({ ...props }) => {
  const managerRef = React.useRef(new BleManager());

  React.useEffect(() => {
    console.log("Building BLETest...");
    return () => {};
  }, []);

  React.useEffect(() => {
    const subscription = managerRef.current.onStateChange((state) => {
      console.log("STATE", state);
      if (state === "PoweredOn") {
        // scanAndConnect();
        subscription.remove();
      }
    }, true);
    return () => subscription.remove();
  }, []);

  const scanAndConnect = () => {
    managerRef.current.startDeviceScan(null, null, (error, device) => {
      // Handle error (scanning will be stopped automatically)
      if (error || !device.name) return;
      console.log(
        "device found :",
        `id (${device.id}), name ("${device.name}"), localName (${device.localName})`
      );
      // Check if it is a device you are looking for based on advertisement data or other criteria.
      if (device.id === "AD14FC98-1B56-D21B-E530-B7B680014117") {
        device
          .connect({
            autoConnect: false,
          })
          .then((device) => {
            device.discoverAllServicesAndCharacteristics().then((device) => {
              device.services().then((services) => {
                services.forEach((service) => {
                  console.log("Service UUID", service.uuid);
                  console.log("Service DeviceID", service.deviceID);
                  service.characteristics().then((chars) => {
                    chars.forEach((char) => {
                      console.log("Characteristic UUID", char.uuid);
                      char.read().then((characteristic) => {
                        console.log(
                          "Value on Read",
                          new Buffer(characteristic.value, "base64").toString(
                            "utf8"
                          )
                        );
                      });
                      char
                        .writeWithResponse("TEST TEXT")
                        .then((characteristic) => {
                          console.log(
                            "Value on Read",
                            new Buffer(characteristic.value).toString("base64")
                          );
                        });
                    });
                  });
                });
              });
            });
            // device.discoverAllServicesAndCharacteristics().then((device) => {
            //
            // })
          });
        // Stop scanning as it's not necessary if you are scanning for one device.
        managerRef.current.stopDeviceScan();
        // Proceed with connection.
      }
    });
  };

  return (
    <View style={styles.container} {...props}>
      <Text>BLETest</Text>
      <StatusBar style="auto" />
    </View>
  );
};

export default BLETest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from "react";
import { Button, ButtonProps } from "@rneui/base";
import { StyleProp, StyleSheet } from "react-native";
import { calcWidth } from "../helpers/deviceResponsiveHelper";

interface Props extends ButtonProps {
	style?: StyleProp<any>;
	buttonStyle?: StyleProp<any>;
}

const BaseButton: React.FC<Props> = ({ color, type, style, buttonStyle, ...props }) => {
	return (
		<Button
			type={type}
			color={color}
			style={{
				...styles.button,
				...style,
			}}
			buttonStyle={{
				borderRadius: 8,
				justifyContent: "flex-start",
				paddingVertical: 12,
				paddingLeft: 12,
				...buttonStyle,
			}}
			{...props}
		/>
	);
};

export default BaseButton;

const styles = StyleSheet.create({
	button: {
		marginHorizontal: calcWidth(3),
	},
});

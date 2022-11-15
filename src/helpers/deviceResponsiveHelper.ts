import { Dimensions } from 'react-native';

export const calcWidth = (percentageOfDeviceToTake: number, maxValue?: number): number => {
  const screenWidth = Dimensions.get('window').width;
  const result = Math.round((screenWidth * percentageOfDeviceToTake) / 100);
  return maxValue && result > maxValue ? maxValue : result;
};

export const calcHeight = (percentageOfDeviceToTake: number, maxValue?: number): number => {
  const screenHeight = Dimensions.get('window').height;
  const result = Math.round((screenHeight * percentageOfDeviceToTake) / 100);
  return maxValue && result > maxValue ? maxValue : result;
};

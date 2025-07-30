import { Dimensions, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

export const isTablet = () => {
  const aspectRatio = height / width;
  return Platform.isPad || (width >= 768 && aspectRatio < 1.6);
};

export const isLandscape = () => {
  return width > height;
};

export const getResponsiveSize = (phoneSize, tabletSize) => {
  return isTablet() ? tabletSize : phoneSize;
};

export const getResponsiveWidth = (percentage) => {
  if (isTablet()) {
    return isLandscape() ? wp(percentage * 0.7) : wp(percentage * 0.8);
  }
  return wp(percentage);
};

export const getResponsiveHeight = (percentage) => {
  if (isTablet()) {
    return isLandscape() ? hp(percentage * 1.2) : hp(percentage);
  }
  return hp(percentage);
};

export const getResponsiveFontSize = (size) => {
  if (isTablet()) {
    return isLandscape() ? size * 1.3 : size * 1.1;
  }
  return size;
};

export const getResponsivePadding = (padding) => {
  if (isTablet()) {
    return isLandscape() ? padding * 1.5 : padding * 1.2;
  }
  return padding;
};

export const getTabletLayoutStyle = () => {
  if (!isTablet()) return {};
  
  return {
    maxWidth: isLandscape() ? '70%' : '80%',
    alignSelf: 'center',
    paddingHorizontal: isLandscape() ? 40 : 20,
  };
};

export default {
  isTablet,
  isLandscape,
  getResponsiveSize,
  getResponsiveWidth,
  getResponsiveHeight,
  getResponsiveFontSize,
  getResponsivePadding,
  getTabletLayoutStyle,
};

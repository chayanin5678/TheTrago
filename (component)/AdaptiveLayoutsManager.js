// Android 16 Adaptive Layouts Utility
import { Dimensions, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export class AdaptiveLayoutsManager {
  constructor() {
    if (AdaptiveLayoutsManager.instance) {
      return AdaptiveLayoutsManager.instance;
    }
    
    this.currentConfig = this.calculateConfig();
    this.listeners = [];
    this.setupListener();
    AdaptiveLayoutsManager.instance = this;
  }

  static getInstance() {
    if (!AdaptiveLayoutsManager.instance) {
      AdaptiveLayoutsManager.instance = new AdaptiveLayoutsManager();
    }
    return AdaptiveLayoutsManager.instance;
  }

  calculateConfig() {
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    const smallestWidth = Math.min(width, height);
    
    // Android 16 uses 600dp as the threshold for large screens
    const isLargeScreen = smallestWidth >= 600;
    const isTablet = isLargeScreen;
    
    let screenType = 'phone';
    if (smallestWidth >= 600) {
      screenType = 'tablet';
    }
    if (smallestWidth >= 1024) {
      screenType = 'desktop';
    }

    return {
      isLargeScreen,
      isLandscape,
      isTablet,
      screenType,
      orientation: isLandscape ? 'landscape' : 'portrait',
      width,
      height,
      smallestWidth
    };
  }

  setupListener() {
    Dimensions.addEventListener('change', ({ window }) => {
      const newConfig = this.calculateConfig();
      if (this.hasConfigChanged(this.currentConfig, newConfig)) {
        this.currentConfig = newConfig;
        this.notifyListeners();
      }
    });
  }

  hasConfigChanged(oldConfig, newConfig) {
    return (
      oldConfig.isLargeScreen !== newConfig.isLargeScreen ||
      oldConfig.isLandscape !== newConfig.isLandscape ||
      oldConfig.screenType !== newConfig.screenType
    );
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentConfig));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getCurrentConfig() {
    return { ...this.currentConfig };
  }

  // Utility methods for responsive design
  getFlexDirection() {
    return this.currentConfig.isLandscape && this.currentConfig.isLargeScreen ? 'row' : 'column';
  }

  getContainerPadding() {
    if (this.currentConfig.isLargeScreen) {
      return this.currentConfig.isLandscape ? wp(3) : wp(5);
    }
    return wp(4);
  }

  getColumnWidth() {
    if (this.currentConfig.isLandscape && this.currentConfig.isLargeScreen) {
      return '48%'; // Two column layout on large landscape screens
    }
    return '100%'; // Single column on phones and portrait tablets
  }

  getFontSize(baseSize) {
    const scaleFactor = this.currentConfig.isLargeScreen ? 1.1 : 1.0;
    return baseSize * scaleFactor;
  }

  getButtonHeight() {
    return this.currentConfig.isLargeScreen ? hp(6.5) : hp(6);
  }

  getHeaderHeight() {
    return this.currentConfig.isLargeScreen ? hp(8) : hp(7);
  }

  // Android 16 specific configurations
  isAndroid16Compatible() {
    return Platform.OS === 'android' && Platform.Version >= 34; // Android 16 will be API 35+
  }

  shouldUseAdaptiveLayouts() {
    return this.isAndroid16Compatible() && this.currentConfig.isLargeScreen;
  }

  getAdaptiveContainerStyle() {
    const { isLargeScreen, isLandscape } = this.currentConfig;
    
    return {
      flex: 1,
      flexDirection: this.getFlexDirection(),
      padding: this.getContainerPadding(),
      maxWidth: isLargeScreen && isLandscape ? wp(95) : '100%',
      alignSelf: isLargeScreen && isLandscape ? 'center' : 'stretch'
    };
  }

  getAdaptiveScrollViewStyle() {
    return {
      flex: 1,
      showsVerticalScrollIndicator: false,
      contentContainerStyle: {
        paddingBottom: this.currentConfig.isLargeScreen ? hp(3) : hp(2)
      }
    };
  }
}

// React Hook for using adaptive layouts
import { useEffect, useState } from 'react';

export const useAdaptiveLayouts = () => {
  const [config, setConfig] = useState(() => 
    AdaptiveLayoutsManager.getInstance().getCurrentConfig()
  );

  useEffect(() => {
    const manager = AdaptiveLayoutsManager.getInstance();
    const unsubscribe = manager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return config;
};

// Helper functions for common responsive patterns
export const adaptiveStyles = {
  container: (config) => ({
    flex: 1,
    padding: config.isLargeScreen ? wp(3) : wp(4),
    maxWidth: config.isLandscape && config.isLargeScreen ? wp(95) : '100%',
    alignSelf: config.isLandscape && config.isLargeScreen ? 'center' : 'stretch'
  }),

  twoColumnLayout: (config) => ({
    flexDirection: config.isLandscape && config.isLargeScreen ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: wp(2)
  }),

  adaptiveButton: (config) => ({
    height: config.isLargeScreen ? hp(6.5) : hp(6),
    width: config.isLandscape && config.isLargeScreen ? wp(45) : wp(85),
    borderRadius: config.isLargeScreen ? 12 : 10
  }),

  adaptiveText: (config, baseSize) => ({
    fontSize: baseSize * (config.isLargeScreen ? 1.1 : 1.0),
    lineHeight: baseSize * (config.isLargeScreen ? 1.4 : 1.3)
  })
};

export default AdaptiveLayoutsManager;

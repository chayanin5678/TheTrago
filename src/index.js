// src/index.js - Main exports for easy importing
export { default as HomeScreen } from './screens/HomeScreen';
export { default as SearchFerry } from './screens/SearchFerry';
export { default as TripDetail } from './screens/TripDetail';
export { default as StartingPointScreen } from './screens/StartingPointScreen';
export { default as EndPointScreen } from './screens/EndPointScreen';
export { default as QRCodeScannerScreen } from './screens/QRCodeScannerScreen';

// Contexts
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { default as PromotionProvider } from './contexts/PromotionProvider';

// Components
export { default as AdaptiveLayoutsManager, useAdaptiveLayouts, adaptiveStyles } from './components/component/AdaptiveLayoutsManager';
export { default as Logo } from './components/component/Logo';
export { default as SplashScreenComponent } from './components/component/SplashScreenComponent';

// Config
export { navigationRef } from './config/navigationRef';
export { default as ipconfig } from './config/ipconfig';
export { default as socialConfig } from './config/socialConfig';
export { default as ocrConfig } from './config/ocr-config';

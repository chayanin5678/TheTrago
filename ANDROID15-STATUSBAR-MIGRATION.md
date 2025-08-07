# Android 15 Edge-to-Edge StatusBar Migration

## Warning Resolution: StatusBar backgroundColor not supported

### Issue
The warning `StatusBar backgroundColor is not supported with edge-to-edge enabled` appears because Android 15's edge-to-edge mode doesn't support the `backgroundColor` prop on StatusBar components.

### Solution
Use the `CrossPlatformStatusBar` component instead of direct `StatusBar` usage.

## Migration Guide

### ❌ Old Approach (causes warning)
```jsx
import { StatusBar } from 'react-native';

<StatusBar barStyle="light-content" backgroundColor="#FD501E" translucent />
```

### ✅ New Approach (Android 15 compatible)
```jsx
import CrossPlatformStatusBar from '../../../components/component/CrossPlatformStatusBar';

<CrossPlatformStatusBar
  barStyle="light-content"
  backgroundColor="#FD501E"
  showGradient={true}
/>
```

## Files That Need Migration

The following files still use direct StatusBar components and should be migrated:

### Screen Components
- `src/screens/Screen/CustomerInfo.js` - Lines 889, 1113, 1240
- `src/screens/Screen/PaymentScreen.js` - Lines 960, 1129
- `src/screens/Screen/ResultScreen.js` - Line 688
- `src/screens/Screen/AddCardScreen.js` - Line 167
- `src/screens/Screen/LoginScreen.js` - Line 298
- `src/screens/Screen/TermsScreen.js` - Line 157
- `src/screens/Screen/RegisterScreen.js` - Line 270
- `src/screens/Screen/ProfileScreen.js` - Lines 661, 751

### Main Screens
- `src/screens/TripDetail.js` - Line 1164
- `src/screens/SearchFerry.js` - Line 1060 (uses expo-status-bar)

## Benefits of CrossPlatformStatusBar

1. **Android 15 Compatibility**: Automatically handles edge-to-edge mode
2. **Gradient Support**: Built-in gradient overlay functionality
3. **Cross-platform Consistency**: Works identically on iOS and Android
4. **Safe Area Handling**: Proper integration with SafeAreaProvider
5. **Future-proof**: Handles Android 16+ requirements

## Implementation Priority

**High Priority**: Screen components that users interact with frequently
**Medium Priority**: Modal and secondary screens
**Low Priority**: Components already using expo-status-bar correctly

## Testing Notes

- Test on Android 15+ devices to verify warning resolution
- Verify visual consistency across different screen sizes
- Check gradient overlay positioning in edge-to-edge mode

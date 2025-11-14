import { useEffect } from 'react';

/**
 * Hide Bottom Tab Bar Utilities
 * 
 * Simple utilities to manually control bottom tab bar visibility
 * Use these functions to hide/show the tab bar from any screen
 */

/**
 * Hide the bottom tab bar
 * Call this function to hide the tab bar immediately
 */
export const hideBottomTabBar = () => {
  // Use a reference count so multiple screens can request the tab bar hidden
  // without clobbering each other. Each hide increments the counter; each
  // show decrements. The tab bar is visible only when the counter is 0.
  if (typeof global._tabBarHideCount === 'undefined') global._tabBarHideCount = 0;
  global._tabBarHideCount = Number(global._tabBarHideCount) + 1;
  if (typeof global.setTabBarVisible === 'function') {
    global.setTabBarVisible(false);
  }
  global.isTabBarVisible = false;
};

/**
 * Show the bottom tab bar
 * Call this function to show the tab bar immediately
 */
export const showBottomTabBar = () => {
  // Decrement the hide counter; only actually show when count reaches 0.
  if (typeof global._tabBarHideCount === 'undefined') global._tabBarHideCount = 0;
  global._tabBarHideCount = Math.max(0, Number(global._tabBarHideCount) - 1);
  if (global._tabBarHideCount === 0) {
    if (typeof global.setTabBarVisible === 'function') {
      global.setTabBarVisible(true);
    }
    global.isTabBarVisible = true;
  }
};

/**
 * Toggle bottom tab bar visibility
 * Switches between hidden and visible states
 */
export const toggleBottomTabBar = () => {
  const currentState = global.isTabBarVisible !== false;
  if (currentState) {
    hideBottomTabBar();
  } else {
    showBottomTabBar();
  }
};

/**
 * Hook: Hide tab bar when component mounts
 * Automatically shows tab bar when component unmounts
 * 
 * Usage:
 * ```javascript
 * import { useHideBottomTabBar } from '../utils/hideBottomTabBar';
 * 
 * function MyScreen() {
 *   useHideBottomTabBar(); // Tab bar hidden while on this screen
 *   // ...
 * }
 * ```
 */
export const useHideBottomTabBar = () => {
  useEffect(() => {
    hideBottomTabBar();

    return () => {
      showBottomTabBar();
    };
  }, []);
};

/**
 * Hook: Hide tab bar permanently (doesn't restore on unmount)
 * Use this when you want to hide the tab bar and keep it hidden
 * 
 * Usage:
 * ```javascript
 * import { useHideBottomTabBarPermanent } from '../utils/hideBottomTabBar';
 * 
 * function MyScreen() {
 *   useHideBottomTabBarPermanent(); // Tab bar stays hidden
 *   // ...
 * }
 * ```
 */
export const useHideBottomTabBarPermanent = () => {
  useEffect(() => {
    // Permanent hide increments the counter and does not decrement on unmount
    // so the tab bar remains hidden until explicitly shown via
    // `showBottomTabBar()`.
    if (typeof global._tabBarHideCount === 'undefined') global._tabBarHideCount = 0;
    global._tabBarHideCount = Number(global._tabBarHideCount) + 1;
    if (typeof global.setTabBarVisible === 'function') global.setTabBarVisible(false);
    global.isTabBarVisible = false;
  }, []);
};

/**
 * Hook: Show tab bar when component mounts
 * Useful for ensuring tab bar is visible on specific screens
 * 
 * Usage:
 * ```javascript
 * import { useShowBottomTabBar } from '../utils/hideBottomTabBar';
 * 
 * function MyScreen() {
 *   useShowBottomTabBar(); // Tab bar always visible on this screen
 *   // ...
 * }
 * ```
 */
export const useShowBottomTabBar = () => {
  useEffect(() => {
    // Force show: reset counter and make visible
    global._tabBarHideCount = 0;
    if (typeof global.setTabBarVisible === 'function') global.setTabBarVisible(true);
    global.isTabBarVisible = true;
  }, []);
};

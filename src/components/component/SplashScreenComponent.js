import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreenComponent({ onAnimationEnd }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const [loadingPercent, setLoadingPercent] = useState(0);
  const particleAnims = useRef(
    [...Array(6)].map(() => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Check if onAnimationEnd is a function to prevent errors
    if (typeof onAnimationEnd !== 'function') {
      console.warn('SplashScreenComponent: onAnimationEnd is not a function');
      return;
    }
    // Start particle animations
    const startParticleAnimations = () => {
      particleAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 1000 + (index * 200),
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: -50 - (index * 20),
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    };

    // Start glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Start loading animation
    Animated.timing(loadingAnim, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: false, // Cannot use native driver for width
    }).start();

    // Main logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startParticleAnimations();
      
      // Wait then fade out
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Add a small delay before calling onAnimationEnd to ensure navigation is ready
          setTimeout(() => {
            if (onAnimationEnd && typeof onAnimationEnd === 'function') {
              try {
                onAnimationEnd();
              } catch (error) {
                console.warn('Error calling onAnimationEnd:', error);
              }
            }
          }, 300);
        });
      }, 2500);
    });
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const loadingWidth = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Sync numeric percentage with loadingAnim value
  useEffect(() => {
    const id = loadingAnim.addListener(({ value }) => {
      try {
        const pct = Math.min(100, Math.max(0, Math.round(value * 100)));
        setLoadingPercent(pct);
      } catch (e) {
        // ignore
      }
    });
    return () => {
      loadingAnim.removeListener(id);
    };
  }, [loadingAnim]);

  return (
    <View style={styles.container}>
      {/* Premium Gradient Background */}
      <LinearGradient
        colors={['#FD501E', '#FF6B35', '#FF8956', '#FFA072']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternDot,
              {
                left: `${(i % 5) * 25}%`,
                top: `${Math.floor(i / 5) * 25}%`,
                opacity: 0.1,
              },
            ]}
          />
        ))}
      </View>

      {/* Animated Background Circles */}
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.circle1,
          {
            transform: [{ rotate: rotateInterpolate }],
            opacity: glowOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundCircle,
          styles.circle2,
          {
            transform: [{ rotate: rotateInterpolate }],
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Floating Particles */}
      {particleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: `${20 + (index * 12)}%`,
              top: `${30 + (index * 10)}%`,
              transform: [
                { translateY: anim.translateY },
                { scale: anim.scale },
              ],
              opacity: anim.opacity,
            },
          ]}
        >
          <MaterialIcons
            name={index % 2 === 0 ? 'star' : 'directions-boat'}
            size={16 + (index * 2)}
            color="rgba(255,255,255,0.6)"
          />
        </Animated.View>
      ))}

      {/* Main Logo Container */}
      <View style={styles.logoContainer}>
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        
        {/* Main Logo - wrapped to create circular mask so logo isn't square */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Image
            source={require('../../../assets/icontrago.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: opacityAnim,
            transform: [
              {
                translateY: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.appName}>The Trago</Text>
        <Text style={styles.appTagline}>Your Travel Companion</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.Text style={[styles.loadingPercent, { opacity: opacityAnim }]}>
          {loadingPercent}%
        </Animated.Text>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: loadingWidth,
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.1,
    left: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: height * 0.1,
    right: -width * 0.1,
  },
  particle: {
    position: 'absolute',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  /* New wrapper to mask the logo into a circle */
  logoWrapper: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  /* Ensure the image fills the wrapper but keeps aspect ratio; use transparent background */
  logoImage: {
    width: '110%',
    height: '110%',
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.6,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  loadingPercent: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

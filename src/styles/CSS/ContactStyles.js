import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const ContactStyles = StyleSheet.create({
  // Ultra Premium Gradient Backgrounds
  premiumGradients: {
    goldGradient: ['#FFD700', '#FFA500', '#FF8C00'],
    luxuryGradient: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
    cardGradient: ['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)'],
    buttonGradient: ['#FFD700', '#FFB000', '#FF8C00'],
  },

  // Ultra Premium Shadows
  premiumShadows: {
    goldShadow: {
      /* shadow/elevation removed */
    },
    cardShadow: {
      /* shadow/elevation removed */
    },
  },

  // Premium Typography
  premiumText: {
    heroTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: '#FFD700',
      textAlign: 'center',
      letterSpacing: 1,
  /* textShadow removed */
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFD700',
      textAlign: 'center',
      marginBottom: 25,
      letterSpacing: 0.5,
    },
    premiumButton: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1a1a2e',
      letterSpacing: 0.5,
    },
  },

  // Ultra Premium Animations
  animations: {
    floating: {
      transform: [
        {
          translateY: new Animated.Value(0),
        },
      ],
    },
    pulse: {
      transform: [
        {
          scale: new Animated.Value(1),
        },
      ],
    },
  },

  // Premium Blur Effects
  blurEffects: {
    strong: { intensity: 100 },
    medium: { intensity: 80 },
    light: { intensity: 60 },
  },
});

export default ContactStyles;

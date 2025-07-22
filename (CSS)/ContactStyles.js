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
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 12,
    },
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
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
      textShadowColor: 'rgba(255, 215, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
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

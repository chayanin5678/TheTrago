import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <BlurView intensity={80} tint="light" style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,248,243,0.9)', 'rgba(253,80,30,0.1)']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#FD501E" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          
          <View style={styles.placeholder} />
        </LinearGradient>
      </BlurView>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#fff', '#f8f9ff', '#fff']}
            style={styles.heroGradient}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FD501E', '#FF6B35']}
                style={styles.iconGradient}
              >
                <MaterialIcons name="privacy-tip" size={36} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Please read our privacy policy to understand how we protect your data</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy of The Trago</Text>
          <Text style={styles.text}>
            The Trago is committed to respecting and protecting your privacy and complying with data protection and privacy laws. We have provided this Privacy Policy to help you understand how we collect, use, store, and protect your information as one of our customers.
          </Text>
          <Text style={styles.text}>
            For all our services, the data controller, the company responsible for your privacy is The Trago.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes your name, email address, phone number, payment information, and travel preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Information</Text>
          <Text style={styles.text}>
            We use the information we collect to provide our services, process transactions, communicate with you, improve our services, comply with legal obligations, and protect our rights and the rights of others.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.text}>
            Trident Master Company Limited (www.thetrago.com)
          </Text>
          <Text style={styles.text}>
            Email: info@thetrago.com, sale@thetrago.com, info@worldferry.com
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: StatusBar.currentHeight || 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FD501E',
  },
  placeholder: {
    width: 48,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingTop: 120,
    paddingBottom: 40,
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4a5568',
    textAlign: 'justify',
    marginBottom: 12,
  },
  bottomPadding: {
    height: 60,
  },
});

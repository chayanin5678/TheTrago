import React from 'react';
import { useLanguage } from '../../screens/Screen/LanguageContext';
import { View, StyleSheet, Image, Text, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function Step({ logoUri }) { 
  const { t } = useLanguage();
  
  // Enhanced Step Component
  const StepCircle = ({ isActive, isPassed, number, children }) => {
    if (isPassed) {
      return (
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          style={styles.circlepass}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.circleInner}>
            {children}
          </View>
        </LinearGradient>
      );
    }
    
    if (isActive) {
      return (
        <LinearGradient
          colors={['#FD501E', '#E8461A', '#D13C16']}
          style={styles.circleactive}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.circleInner}>
            <Text style={styles.textactive}>{number}</Text>
          </View>
        </LinearGradient>
      );
    }
    
    return (
      <View style={styles.circledissable}>
        <Text style={styles.textdissable}>{number}</Text>
      </View>
    );
  };

  const ConnectorLine = ({ isCompleted }) => (
    <View style={styles.lineContainer}>
      <View style={[styles.lineBackground, isCompleted && styles.lineCompleted]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.circleRow}>
        {/* Step 1 */}
        <View style={styles.stepItemContainer}>
          <View style={styles.circleContainer}>
            <StepCircle isPassed={true}>
              <Entypo name="check" size={wp('5%')} color="white" />
            </StepCircle>
          </View>
          <Text style={[styles.step, styles.stepCompleted]}>{t('chooseYourBoat')}</Text>
        </View>
        
        {/* Step 2 */}
        <View style={styles.stepItemContainer}>
          <View style={styles.circleContainer}>
            <StepCircle 
              isPassed={logoUri >= 2} 
              isActive={logoUri === 1} 
              number="2" 
            >
              {logoUri >= 2 && <Entypo name="check" size={wp('5%')} color="white" />}
            </StepCircle>
          </View>
          <Text style={logoUri === 1 ? [styles.step, styles.stepActive] : logoUri >= 2 ? [styles.step, styles.stepCompleted] : styles.step}>{t('shuttleTransfer')}</Text>
        </View>
        
        {/* Step 3 */}
        <View style={styles.stepItemContainer}>
          <View style={styles.circleContainer}>
            <StepCircle 
              isPassed={logoUri > 2} 
              isActive={logoUri === 2} 
              number="3" 
            >
              {logoUri > 2 && <Entypo name="check" size={wp('5%')} color="white" />}
            </StepCircle>
          </View>
          <Text style={logoUri === 2 ? [styles.step, styles.stepActive] : logoUri > 2 ? [styles.step, styles.stepCompleted] : styles.step}>{t('customerInformation')}</Text>
        </View>
        
        {/* Step 4 */}
        <View style={styles.stepItemContainer}>
          <View style={styles.circleContainer}>
            <StepCircle 
              isActive={logoUri === 3} 
              number="4" 
            />
          </View>
          <Text style={logoUri === 3 ? [styles.step, styles.stepActive] : styles.step}>{t('payment')}</Text>
        </View>
        
        {/* Connector Lines */}
        <View style={[styles.lineContainer, { left: wp('20%'), right: wp('60%') }]}>
          <View style={[styles.lineBackground, styles.lineCompleted]} />
        </View>
        
        <View style={[styles.lineContainer, { left: wp('40%'), right: wp('40%') }]}>
          <View style={[styles.lineBackground, logoUri >= 2 && styles.lineCompleted]} />
        </View>
        
        <View style={[styles.lineContainer, { left: wp('60%'), right: wp('20%') }]}>
          <View style={[styles.lineBackground, logoUri > 2 && styles.lineCompleted]} />
        </View>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: wp('6%'),
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('3%'),
    marginHorizontal: wp('4%'),
  },
  rowText: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: wp('2%'),
  },
  circleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: wp('2%'),
    position: 'relative',
  },
  stepItemContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: wp('20%'),
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
    zIndex: 2,
  },
  labelRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: wp('2%'),
  },
  col: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: wp('1%'),
  },
  circleactive: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FD501E',
    shadowOpacity: 0.4,
    shadowRadius: wp('3%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 12,
    borderWidth: wp('0.5%'),
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 48,
    minHeight: 48,
    maxWidth: 48,
    maxHeight: 48,
  },
  circlepass: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: wp('3%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 12,
    borderWidth: wp('0.5%'),
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 48,
    minHeight: 48,
    maxWidth: 48,
    maxHeight: 48,
  },
  circledissable: {
    backgroundColor: 'rgba(148, 163, 184, 0.6)',
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.2,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 4,
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 48,
    minHeight: 48,
    maxWidth: 48,
    maxHeight: 48,
  },
  circleInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textactive: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '800',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 2,
    textShadowOffset: { width: 1, height: 1 },
  },
  textdissable: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  step: {
    fontSize: wp('2.5%'),
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: wp('3.2%'),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 1,
    marginTop: hp('0.5%'),
  },
  stepActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 2,
  },
  stepCompleted: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  lineContainer: {
    position: 'absolute',
    top: hp('3%'),
    left: wp('22%'),
    right: wp('22%'),
    height: wp('0.8%'),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lineBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: wp('0.4%'),
  },
  lineCompleted: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: wp('1%'),
    elevation: 4,
  },
});

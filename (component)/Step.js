import React from 'react';
import { View, StyleSheet, Image, Text, Dimensions  } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function Step({ logoUri }) { 
 

  return (

    <View style={styles.rowText}>
            {logoUri === 1 && (
                 <>
      <View style={styles.col}>
        <View style={styles.circlepass}>
        <Entypo name="check" size={22} color="white" />
        </View>
        <Text style={styles.step}>Choose Your Boat</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circleactive}>
          <Text style={styles.textactive}>2</Text>
        </View>
        <Text style={styles.step}>Shutttle Transfer</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circledissable}>
          <Text style={styles.textdissable}>3</Text>
        </View>
        <Text style={styles.step}>Customer Information</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circledissable}>
          <Text style={styles.textdissable}>4</Text>
        </View>
        <Text style={styles.step}>Payment</Text>
      </View>
   </>
      )}
        {logoUri === 2 && (
                 <>
      <View style={styles.col}>
        <View style={styles.circlepass}>
        <Entypo name="check" size={22} color="white" />
        </View>
        <Text style={styles.step}>Choose Your Boat</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circlepass}>
        <Entypo style name="check" size={22} color="white" />
        </View>
        <Text style={styles.step}>Shuttle Transfer</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circleactive}>
          <Text style={styles.textactive}>3</Text>
        </View>
        <Text style={styles.step}>Customer Information</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circledissable}>
          <Text style={styles.textdissable}>4</Text>
        </View>
        <Text style={styles.step}>Payment</Text>
      </View>
   </>
      )}
       {logoUri === 3 && (
                 <>
      <View style={styles.col}>
        <View style={styles.circlepass}>
        <Entypo name="check" size={22} color="white" />
        </View>
        <Text style={styles.step}>Choose Your Boat</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circlepass}>
        <Entypo name="check" size={22} color="white" />
        </View>
        <Text style={styles.step}>Shuttle Transfer</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circlepass}>
        <Entypo name="check" size={22} color="white" />
        </View>
        <Text style={styles.step}>Customer Information</Text>
      </View>
      <Image source={require('./../assets/Line 9.png')} style={styles.linerow} />

      <View style={styles.col}>
        <View style={styles.circleactive}>
          <Text style={styles.textactive}>4</Text>
        </View>
        <Text style={styles.step}>Payment</Text>
      </View>
   </>
      )}
    </View>

  );
}

const styles = StyleSheet.create({
  rowText: {
    width: '100%',
    flexDirection: 'row',
    margin: '2%',
    marginBottom:40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
    marginVertical: hp("2%"),


  },
  col: {
    flexDirection: 'column',
    margin: 10,
    width: wp("22%"),
    height:50,
    alignItems: 'center',
  
  },
  circleactive: {
    backgroundColor: '#FD501E',
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlepass: {
    backgroundColor: '#09a4f8',
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textactive: {
    color: '#FFF',
    fontSize: hp("2%"),
  },
  step: {
    marginTop: hp("1%"),
    fontSize: hp("1.5%"),
    textAlign: "center",
    width: wp("22%"),
   
   
  },
  linerow: {
    marginBottom: 20,
    marginLeft: -20,
    marginRight: -20,
    width: 30,
  },
  circledissable: {
    backgroundColor: '#EAEAEA',
    height: 40,
    width: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textdissable: {
    fontSize: 16,
    color: '#666666',
  },
});

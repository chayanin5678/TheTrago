import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
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
        <Entypo name="check" size={22} color="white" />
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
    margin: 5,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0

  },
  col: {
    flexDirection: 'column',
    margin: 10,
    width: 95,
    height:50,
    alignItems: 'center',
  
  },
  circleactive: {
    backgroundColor: '#FD501E',
    height: 40,
    width: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlepass: {
    backgroundColor: '#09a4f8',
    height: 40,
    width: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textactive: {
    color: '#FFF',
    fontSize: 16,
  },
  step: {
    fontSize: 10,
    flexWrap:'wrap',
    maxWidth:100,
   
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

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function cardsearch() {
  return (
    <View style={styles.bookingSection}>
              <View style={styles.tripTypeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.tripTypeOneWayButton,
                          tripType === "One Way Trip" && styles.activeButton,
                        ]}
                        onPress={() => setTripType("One Way Trip")}
                      >
                        <Text
                          style={[
                            styles.tripTypeText,
                            tripType === "One Way Trip" && styles.activeText,
                            
                          ]}
                        >
                          One Way Trip
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.tripTypeRoundButton,
                          tripType === "Round Trip" && styles.activeButton,
                        ]}
                        onPress={() => setTripType("Round Trip")}
                      >
                        <Text
                          style={[
                            styles.tripTypeText,
                            tripType === "Round Trip" && styles.activeText,
                          
                          ]}
                        >
                          Round Trip
                        </Text>
                      </TouchableOpacity>
                    </View>
    
              <View style={styles.inputRow}>
              <View style={styles.inputBoxDrop}>
              <TouchableOpacity style={styles.button} onPress={toggleAdultModal}>
            <Text style={styles.buttonText}>{adults} Adult</Text>
            <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
          </TouchableOpacity>
    
          {/* Adult Modal */}
          <Modal
            visible={isAdultModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={toggleAdultModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={adultOptions}
                  renderItem={renderAdultOption}
                  keyExtractor={(item) => item.toString()}
                />
              </View>
            </View>
          </Modal>
          <TouchableOpacity style={styles.button} onPress={toggleChildModal}>
          <Text style={styles.buttonText}>{children} Child</Text>
          <Icon name="chevron-down" size={20} color="#FD501E" style={styles.dropdownIcon} />
        </TouchableOpacity>
    
        {/* Child Modal */}
        <Modal
          visible={isChildModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={toggleChildModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <FlatList
                data={childOptions}
                renderItem={renderChildOption}
                keyExtractor={(item) => item.toString()}
              />
            </View>
          </View>
        </Modal>
              </View>
            </View>
                    
            
            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('StartingPointScreen', { setStartingPoint })}
                style={styles.inputBox} >         
                <Image
                  source={require('./assets/directions_boat.png')}
                  style={styles.logoDate}
                  resizeMode="contain"
                />
                <View >  
                  <View style={styles.inputBoxCol}>
                    <Text style={styles.inputLabel}>From</Text>
                    <Text style={styles.inputText}> {truncateText(startingPoint.name)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
    
              {/* Swap icon */}
              <TouchableOpacity onPress={swapPoints}>
                <Image
                  source={require('./assets/mage_exchange-a.png')}
                  style={styles.logoSwap}
                  resizeMode="contain"
                />
              </TouchableOpacity>
    
              <TouchableOpacity
                onPress={() => navigation.navigate('EndPointScreen', { setEndPoint ,startingPointId: startingPoint.id,})}
                style={styles.inputBox} >     
                <Image
                  source={require('./assets/location_on.png')}
                  style={styles.logoDate}
                  resizeMode="contain"
                />
                <View style={styles.inputBoxCol}>
                  <Text style={styles.inputLabel}>To</Text>
                  <Text style={styles.inputText}> {truncateText(endPoint.name)}</Text>
                </View>
              </TouchableOpacity>
            </View>
    
            <View style={styles.inputRow}>
              <View style={styles.inputBox}>
                <TouchableOpacity onPress={showDepartureDatePicker}
                  style={styles.rowdepart}>
                  <Image
                    source={require('./assets/solar_calendar-bold.png')}
                    style={styles.logoDate}
                    resizeMode="contain"
                  />
                  <View style={styles.inputBoxCol}>
                    <Text style={styles.inputLabel}>Departure date</Text>
                    <Text style={styles.inputText}>{departureDate}</Text>
                  </View>
                </TouchableOpacity>
                {tripType === 'Round Trip' && (
      <>
        <Image
          source={require('./assets/Line 2.png')}
          style={styles.logoLine}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={showReturnDatePicker} style={styles.rowdepart}>
          <Image
            source={require('./assets/solar_calendar-yellow.png')}
            style={styles.logoDate}
            resizeMode="contain"
          />
          <View style={styles.inputBoxCol}>
            <Text style={styles.inputLabel}>Return date</Text>
            <Text style={styles.inputText}>{returnDate}</Text>
          </View>
        </TouchableOpacity>
      </>
    )}
              </View>
            </View>
          </View>
    
        
  )
}

const styles = StyleSheet.create({
    bookingSection: {
        backgroundColor: '#F6F6F6',
        borderRadius: 30,
        padding: 20,
        width: '100%',
        marginBottom: 0,
        paddingBottom: 0,
        shadowColor: '#F6F6F6',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      },
      tripTypeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
      },
      tripTypeOneWayButton: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 15,
        borderBottomRightRadius:0,
        borderTopRightRadius:0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        marginHorizontal: 5,
        flex: 1,
        justifyContent: 'center', 
        marginRight: 0,
        width: '100%',
        height:50,
        alignItems: 'center',
      },
      activeButton: {
        backgroundColor: "#FD501E",
      },
      tripTypeText: {
        fontSize: 16,
        color: "#333",
        fontWeight:'bold'
      },
      activeText: {
        color: "#FFF",
      },
      tripTypeRoundButton: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 15,
        borderBottomLeftRadius:0,
        borderTopLeftRadius:0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        marginHorizontal: 5,
        flex: 1,
        justifyContent: 'center', 
        marginLeft:0,
        marginRight: 5,
        width: '100%',
        height:50,
        alignItems: 'center',
      },
      inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',  
        marginBottom: 15,
      },
      inputBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        marginHorizontal: 5,
        flex: 1,
        justifyContent: 'flex-start', // จัดตำแหน่งให้เนื้อหาภายในอยู่ตรงกลาง
      },
      logoDate: {
        width: 29,
        height: 27,
        marginRight: 10,
      },

})
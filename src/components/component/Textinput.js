import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'

export default function Textinput({placeholder, value, onChangeText}) {
  return (
    <View style={styles.inputconpromo}>
      <TextInput 
                     style={styles.input} 
                     placeholder={placeholder}
                     placeholderTextColor="#aaa"
                     value={value}
                     onChangeText={onChangeText}
                   />
    </View>
  )
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
      },
      inputconpromo: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        margin:10
     
      },
})

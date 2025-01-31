import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { FontAwesome } from "@expo/vector-icons";

export default function FerrySearch() {
  const [tripType, setTripType] = useState("oneWay");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [from, setFrom] = useState("Phuket");
  const [to, setTo] = useState("Koh Lipe");
  const [date, setDate] = useState("20 Jul 2024");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search ferry</Text>

      <View style={styles.searchContainer}>
        <View style={styles.inputRow}>
          <FontAwesome name="search" size={24} color="#FF6600" />
          <TextInput
            style={styles.input}
            placeholder="Search Here..."
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.tripTypeContainer}>
          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === "oneWay" && styles.activeButton,
            ]}
            onPress={() => setTripType("oneWay")}
          >
            <Text
              style={[
                styles.tripTypeText,
                tripType === "oneWay" && styles.activeText,
              ]}
            >
              One Way Trip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tripTypeButton,
              tripType === "roundTrip" && styles.activeButton,
            ]}
            onPress={() => setTripType("roundTrip")}
          >
            <Text
              style={[
                styles.tripTypeText,
                tripType === "roundTrip" && styles.activeText,
              ]}
            >
              Round Trip
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dropdownRow}>
          <Picker
            selectedValue={adults}
            onValueChange={(itemValue) => setAdults(itemValue)}
            style={styles.dropdown}
          >
            {[...Array(10)].map((_, i) => (
              <Picker.Item key={i} label={`${i} Adult${i > 1 ? "s" : ""}`} value={i} />
            ))}
          </Picker>
          <Picker
            selectedValue={children}
            onValueChange={(itemValue) => setChildren(itemValue)}
            style={styles.dropdown}
          >
            {[...Array(10)].map((_, i) => (
              <Picker.Item
                key={i}
                label={`${i} Child${i > 1 ? "ren" : ""}`}
                value={i}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.input}
            value={from}
            onChangeText={setFrom}
            placeholder="From"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.input}
            value={to}
            onChangeText={setTo}
            placeholder="To"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Departure date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Date"
          />
        </View>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6600",
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginLeft: 10,
    color: "#333",
  },
  tripTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tripTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: "#FF6600",
    borderColor: "#FF6600",
  },
  tripTypeText: {
    fontSize: 16,
    color: "#333",
  },
  activeText: {
    color: "#FFF",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dropdown: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    marginTop: 20,
    backgroundColor: "#FF6600",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
});

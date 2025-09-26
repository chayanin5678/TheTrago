import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import LogoTheTrago from "./../../components/component/Logo";
import headStyles from "../../styles/CSS/StartingPointScreenStyles";
import ipAddress from "../../config/ipconfig";
import { useCustomer } from "./CustomerContext";
import { useLanguage } from "./LanguageContext";
import * as Print from "expo-print";
import * as SecureStore from "expo-secure-store";
import { styles } from "../../styles/CSS/ResultScreenStyles";

const ResultScreen = ({ navigation, route }) => {
  const { customerData, updateCustomerData } = useCustomer();
  const { selectedLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { success } = route.params;

  const [orderStatus, setOrderStatus] = useState("Pending");
  const [pdfUri, setPdfUri] = useState(null);
  const [timetableDepart, settimetableDepart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsgroup, setBookingsGroup] = useState([]);
  

  const EXTRA_TOP_GUTTER = Platform.OS === "android" ? 0 : 16;

  // Expand/collapse states
  const [expandDepart, setExpandDepart] = useState(true);
  const [expandReturn, setExpandReturn] = useState(true);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleExpandDepart = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandDepart((s) => !s);
  };

  const toggleExpandReturn = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandReturn((s) => !s);
  };

  // country code ให้มี + เดียว
  const formatCountryCode = (code) => {
    if (!code) return "";
    const codeStr = code.toString();
    const cleanCode = codeStr.replace(/\+/g, "");
    return "+" + cleanCode;
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>E-TICKET</title>
  <style>
    body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f5f5f5; color:#002348; }
    .container { background:#fff; max-width:800px; margin:20px auto; padding:30px; box-shadow:0 0 10px rgba(0,0,0,0.1); }
    .header { display:flex; justify-content:space-between; align-items:flex-start; }
    .header img { height:50px; }
    .ref-number { font-size:14px; text-align:right; }
    .title-bar { background:#002348; color:#fff; padding:10px; margin:20px 0; text-align:center; font-weight:bold; }
    .location-row { display:flex; justify-content:space-between; text-align:center; margin:20px 0; }
    .location-row div { flex:1; }
    .section { display:flex; justify-content:space-between; margin:20px 0; }
    .section > div { width:48%; }
    .info-table td { padding:4px 0; vertical-align:top; }
    .centerOperator { text-align:center; }
    .highlight { color:green; font-weight:bold; }
    .timeline-box { width:100%; max-width:500px; margin:30px auto; background:#f9f7f7; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; align-items:center; }
    .timeline-row { display:flex; width:100%; padding:15px; align-items:center; background:#f4f1f1; }
    .left { width:40%; text-align:left; padding-left:15px; }
    .center { width:20%; display:flex; flex-direction:column; align-items:center; }
    .right { width:40%; padding-right:15px; text-align:right; }
    .circle { width:10px; height:10px; background:#fff; border:2px solid #000; border-radius:50%; z-index:2; }
    .middle-row { position:relative; height:70px; display:flex; justify-content:center; align-items:center; }
    .line { position:absolute; top:0; bottom:0; left:50%; width:2px; background:#333; transform:translateX(-50%); z-index:0; }
    .middle-content { display:flex; align-items:center; justify-content:center; z-index:1; }
    .label-left, .label-right { font-size:14px; color:#333; width:80px; text-align:center; }
    .circle-icon { width:40px; height:40px; background:#fff; border:2px solid #333; border-radius:50%; display:flex; justify-content:center; align-items:center; }
    .ferry-icon { width:50px; height:50px; margin-top:5px; object-fit:contain; }
  </style>
</head>
<body>
  <div class="container">
    ${timetableDepart.map((item) => `
    <div class="header">
      <img src="https://www.thetrago.com/assets/images/logo.png" alt="The Trago">
      <div class="ref-number">Ref. number<br><strong>${customerData.md_booking_code}</strong></div>
    </div>

    <div class="title-bar">E-TICKET</div>

    <div class="location-row">
      <div><strong>Departure</strong><br>${item.startingpoint_name}<br>(${item.startpier_name})</div>
      <div>⏱<br>${formatTimeToHoursAndMinutes(item.md_timetable_time)}<br>
        <img src="https://www.thetrago.com/Api/uploads/timetabledetail/shiplogo.png" class="ferry-icon" />
      </div>
      <div><strong>Arrival</strong><br>${item.endpoint_name}<br>(${item.endpier_name})</div>
    </div>

    <div class="section">
      <div>
        <h3>Departure</h3>
        <table class="info-table">
          <tr><td><strong>Date:</strong></td><td>${formatDate(customerData.departdate)}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${formatTime(item.md_timetable_departuretime)} - ${formatTime(item.md_timetable_arrivaltime)} | ${formatTimeToHoursAndMinutes(item.md_timetable_time)}</td></tr>
          <tr><td><strong>From:</strong></td><td>${item.startingpoint_name} (${item.startpier_name})</td></tr>
          <tr><td><strong>To:</strong></td><td>${item.endpoint_name} (${item.endpier_name})</td></tr>
          <tr><td><strong>Seat:</strong></td><td>${item.md_seat_nameeng}</td></tr>
        </table>
      </div>
      <div>
        <h3>Passenger</h3>
        <table class="info-table">
          <tr><td><strong>Name:</strong></td><td>${customerData.selectedTitle} ${customerData.Firstname} ${customerData.Lastname}</td></tr>
          <tr><td><strong>Tel.:</strong></td><td>(${formatCountryCode(customerData.countrycode)}) ${formatPhoneNumber(customerData.tel)}</td></tr>
          <tr><td><strong>Adult:</strong></td><td>${customerData.adult} persons</td></tr>
          ${customerData.child !== 0 ? `<tr><td><strong>Child:</strong></td><td>${customerData.child} persons</td></tr>` : ""}
          ${customerData.infant !== 0 ? `<tr><td><strong>Infant:</strong></td><td>${customerData.infant} persons</td></tr>` : ""}
          <tr><td><strong>Payment Status:</strong></td><td><span class="highlight">Paid</span></td></tr>
        </table>
      </div>
    </div>
    `).join("")}
  </div>
</body>
</html>
  `;

  function formatTime(time) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10) % 12 || 12;
    const period = parseInt(hours, 10) >= 12 ? "PM" : "AM";
    return `${hour}:${minutes} ${period}`;
  }

  function formatTimeToHoursAndMinutes(time) {
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    return `${hours} h ${minutes} min`;
  }

  useEffect(() => {
    fetchBookings(customerData.md_booking_code);

    if(customerData.md_booking_groupcode) {
      fetchBookingsgroup(customerData.md_booking_groupcode);
    }

  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("userToken");
        setToken(storedToken);
        setIsLoggedIn(!!storedToken);
      } catch (error) {
        console.error("ResultScreen: Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();

    fetch(`${ipAddress}/timetable/${customerData.timeTableDepartId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          settimetableDepart(data.data);
        } else {
          settimetableDepart([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const printTicket = async () => {
    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error("Error printing ticket: ", error);
    }
  };

  const handleGoBack = () => navigation.goBack();

  function formatDate(dateString) {
    const date = new Date(Date.parse(dateString));
    if (selectedLanguage === "en") {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else {
      return date.toLocaleDateString("th-TH", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length !== 10) return "Invalid number";
    return `${phoneNumber.slice(1, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }

  function formatNumberWithComma(value) {
    if (!value) return "0.00";
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const fetchBookings = async (bookingcode) => {
    if (!bookingcode || bookingcode.trim() === "") {
      setBookings([]);
      return;
    }
    try {
      const response = await fetch(`${ipAddress}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ md_booking_code: bookingcode }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.data)) setBookings(data.data);
      else setBookings([]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  const fetchBookingsgroup = async (bookingcode) => {
    if (!bookingcode || bookingcode.trim() === "") {
      setBookingsGroup([]);
      return;
    }
    try {
      const response = await fetch(`${ipAddress}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ md_booking_code: bookingcode }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.data)) setBookingsGroup(data.data);
      else setBookingsGroup([]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookingsGroup([]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
        <LinearGradient
         
          colors={["#002A5C", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.5 }}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <LinearGradient
            colors={["rgba(255,255,255,0.98)", "rgba(248,250,252,0.96)", "rgba(241,245,249,0.94)"]}
            style={[
              headStyles.headerBg,
              {
                width: "100%",
                marginLeft: "0%",
                paddingTop: insets.top + EXTRA_TOP_GUTTER,
                borderBottomLeftRadius: 45,
                borderBottomRightRadius: 45,
                paddingBottom: 12,
                padding: 12,
                minHeight: hp("13%"),
                borderWidth: 1.5,
                borderColor: "rgba(0, 18, 51, 0.1)",
              },
            ]}
          >
            <View
              style={[
                headStyles.headerRow,
                {
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 0,
                  paddingTop: 0,
                  position: "relative",
                  marginTop: 0,
                  height: 56,
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleGoBack}
                style={{
                  position: "absolute",
                  left: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  borderRadius: 28,
                  padding: 10,
                  zIndex: 2,
                  borderWidth: 1.5,
                  borderColor: "rgba(253, 80, 30, 0.12)",
                }}
              >
                <AntDesign name="arrow-left" size={24} color="#FD501E" />
              </TouchableOpacity>

              {/* โลโก้ */}
              <View style={{ position: "absolute", left: 0, right: 0, alignItems: "center" }}>
                <LogoTheTrago />
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: hp("15%") }]}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            bounces={false}
          >
            {/* Title */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: hp("1.5%"),
                marginHorizontal: wp("5%"),
                marginBottom: hp("2.5%"),
                paddingHorizontal: wp("4%"),
                paddingVertical: hp("2%"),
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: wp("5%"),
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[headStyles.headerTitle, { color: "#FFFFFF", fontSize: wp("6%"), fontWeight: "900", letterSpacing: -0.8, textAlign: "left", marginLeft: 0, lineHeight: wp("8.5%") }]}>
                  {success ? t("bookingConfirmed") : t("bookingFailed")}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: wp("3.8%"), fontWeight: "600", marginTop: hp("0.8%"), letterSpacing: 0.5 }}>
                  {success ? t("ticketConfirmed") : t("contactSupport")}
                </Text>
              </View>
            </View>

            {success && bookings.map((item, idx) => (
              <View style={styles.card} key={item?.md_booking_code ?? idx}>
                {/* Company Header */}
                <View style={styles.companyHeader}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                      style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: "#fff", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", marginRight: 12 }}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>
                      {selectedLanguage === "th" ? item.md_company_namethai : item.md_company_nameeng}
                    </Text>

                     <View style={[styles.infoRow, {flexWrap: 'wrap', maxWidth: '100%'}]}>
                      <Ionicons name="location-outline" size={16} color="#FD501E" />
                      <Text style={styles.infoText}> {selectedLanguage === "th" ? item.start_locationthai : item.start_locationeng}</Text>
                      <AntDesign name="arrow-right" size={12} color="#6B7280" style={{ marginHorizontal: 8 }} />
                      <Text style={styles.infoText}>{selectedLanguage === "th" ? item.end_locationthai : item.end_locationeng}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#FD501E" />
                      <Text style={styles.infoText}> {formatDate(customerData.departdate)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color="#FD501E" />
                      <Text style={styles.infoText}> {customerData.adult} {t("adult")}, {customerData.child} {t("child")}, {customerData.infant} {t("infant")}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Summary */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t("summary")}</Text>
                  <Text style={styles.dateText}>{t("bookingDate")}: {formatDate(item.md_booking_date)}</Text>
                </View>

                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("adult")}</Text>
                  <Text style={styles.detailValue}>{customerData.adult} {t("person")}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("passengerName")}</Text>
                  <Text style={styles.detailValue}>{customerData.Firstname} {customerData.Lastname}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                  <Text style={styles.detailValue}>{formatCountryCode(customerData.countrycode)} {formatPhoneNumber(customerData.tel)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("email")}</Text>
                  <Text style={styles.detailValue}>{customerData.email}</Text>
                </View>

                <View style={styles.divider} />

                {/* PRICE SECTION */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t("priceDetails")}</Text>
                </View>

                {/* DEPART ACCORDION */}
                {customerData.subtotalDepart && customerData.subtotalDepart !== "0" ? (
                  <TouchableOpacity
                    onPress={toggleExpandDepart}
                    activeOpacity={0.8}
                    style={[styles.detailRow, { alignItems: "center" }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons
                        name={expandDepart ? "chevron-down" : "chevron-forward"}
                        size={18}
                        color="#6B7280"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.detailLabel}>
                        {/* ใช้ departTicket ถ้ามี ไม่งั้น fallback เป็น ticketPrice */}
                        {t("ticketPrice") || t("ticketPrice")}
                      </Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {customerData.symbol} {formatNumberWithComma(customerData.subtotalDepart)}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {expandDepart && (
                  <>
                    {customerData.totaladultDepart && customerData.totaladultDepart !== "0" ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("adult")} x {customerData.adult}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.totaladultDepart)}
                        </Text>
                      </View>
                    ) : null}

                    {customerData.child !== 0 ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("child")} x {customerData.child}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.totalchildDepart)}
                        </Text>
                      </View>
                    ) : null}

                    {customerData.infant !== 0 ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("infant")} x {customerData.infant}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.totalinfantDepart)}
                        </Text>
                      </View>
                    ) : null}

                    {customerData.pickupPriceDepart && parseFloat(customerData.pickupPriceDepart) > 0 ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("pickupService")}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.pickupPriceDepart)}
                        </Text>
                      </View>
                    ) : null}

                    {customerData.dropoffPriceDepart && parseFloat(customerData.dropoffPriceDepart) > 0 ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("dropoffService")}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.dropoffPriceDepart)}
                        </Text>
                      </View>
                    ) : null}

                    {customerData.discountDepart && customerData.discountDepart !== "0" ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("discount")}
                        </Text>
                        <Text style={styles.discountText}>
                          - {customerData.symbol} {formatNumberWithComma(customerData.discountDepart)}
                        </Text>
                      </View>
                    ) : null}

                       
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("sum")}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.subtotalDepart)}
                        </Text>
                      </View>
               

                  </>
                  
                )}
                
           

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("subtotal")}</Text>
                  <Text style={styles.detailValue}>
                    {customerData.symbol}{" "}
                    {formatNumberWithComma(
                      parseFloat(customerData.subtotalDepart || 0))}
                  </Text>
                </View>

                <View style={styles.divider} />

             

                {/* Actions */}
              
                  <View style={styles.detailRow}>
                    <Text style={styles.bookingLabel}>{t("bookingCode")}</Text>
                    <Text style={styles.bookingCode}>{customerData.md_booking_code || "N/A"}</Text>
                  </View>

                


              </View>
            ))}

              {success && bookingsgroup.map((item, idx) => (
              <View style={styles.card} key={item?.md_booking_code ?? idx}>
                {/* Company Header */}
                <View style={styles.companyHeader}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={{ uri: `https://thetrago.com/Api/uploads/company/${item.md_company_picname}` }}
                      style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: "#fff", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", marginRight: 12 }}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>
                      {selectedLanguage === "th" ? item.md_company_namethai : item.md_company_nameeng}
                    </Text>

                    <View style={[styles.infoRow, {flexWrap: 'wrap', maxWidth: '100%'}]}>
                      <Ionicons name="location-outline" size={16} color="#FD501E" />
                      <Text style={styles.infoText}> {selectedLanguage === "th" ? item.start_locationthai : item.start_locationeng}</Text>
                      <AntDesign name="arrow-right" size={12} color="#6B7280" style={{ marginHorizontal: 8 }} />
                      <Text style={styles.infoText}>{selectedLanguage === "th" ? item.end_locationthai : item.end_locationeng}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#FD501E" />
                      <Text style={styles.infoText}> {formatDate(customerData.returndate)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color="#FD501E" />
                      <Text style={styles.infoText}> {customerData.adult} {t("adult")}, {customerData.child} {t("child")}, {customerData.infant} {t("infant")}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Summary */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t("summary")}</Text>
                  <Text style={styles.dateText}>{t("bookingDate")}: {formatDate(item.md_booking_date)}</Text>
                </View>

                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("adult")}</Text>
                  <Text style={styles.detailValue}>{customerData.adult} {t("person")}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("passengerName")}</Text>
                  <Text style={styles.detailValue}>{customerData.Firstname} {customerData.Lastname}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                  <Text style={styles.detailValue}>{formatCountryCode(customerData.countrycode)} {formatPhoneNumber(customerData.tel)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("email")}</Text>
                  <Text style={styles.detailValue}>{customerData.email}</Text>
                </View>

                <View style={styles.divider} />

                {/* PRICE SECTION */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t("priceDetails")}</Text>
                </View>

              
                
                {/* RETURN ACCORDION */}
                {customerData.md_booking_groupcode && customerData.subtotalReturn && customerData.subtotalReturn !== "0" ? (
                  <>
                    <TouchableOpacity
                      onPress={toggleExpandReturn}
                      activeOpacity={0.8}
                      style={[styles.detailRow, { alignItems: "center" }]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons
                          name={expandReturn ? "chevron-down" : "chevron-forward"}
                          size={18}
                          color="#6B7280"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.detailLabel}>{t("returnTicket")}</Text>
                      </View>

                      <Text style={styles.detailValue}>
                        {customerData.symbol} {formatNumberWithComma(customerData.subtotalReturn)}
                      </Text>
                    </TouchableOpacity>

                    {expandReturn && (
                      <>
                        {customerData.totaladultReturn && customerData.totaladultReturn !== "0" ? (
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                              • {t("adult") || t("adult")} x {customerData.adult}
                            </Text>
                            <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                              {customerData.symbol} {formatNumberWithComma(customerData.totaladultReturn)}
                            </Text>
                          </View>
                        ) : null}

                        {customerData.child !== 0 ? (
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                              • {t("child") || t("child")} x {customerData.child}
                            </Text>
                            <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                              {customerData.symbol} {formatNumberWithComma(customerData.totalchildReturn)}
                            </Text>
                          </View>
                        ) : null}

                        {customerData.infant !== 0 ? (
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                              • {t("infant") || t("infant")} x {customerData.infant}
                            </Text>
                            <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                              {customerData.symbol} {formatNumberWithComma(customerData.totalinfantReturn)}
                            </Text>
                          </View>
                        ) : null}

                        {customerData.pickupPriceReturn && parseFloat(customerData.pickupPriceReturn) > 0 ? (
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                              • {t("pickupService")}
                            </Text>
                            <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                              {customerData.symbol} {formatNumberWithComma(customerData.pickupPriceReturn)}
                            </Text>
                          </View>
                        ) : null}

                        {customerData.dropoffPriceReturn && parseFloat(customerData.dropoffPriceReturn) > 0 ? (
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                              • {t("dropoffService")}
                            </Text>
                            <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                              {customerData.symbol} {formatNumberWithComma(customerData.dropoffPriceReturn)}
                            </Text>
                          </View>
                        ) : null}

                        {customerData.discountReturn && customerData.discountReturn !== "0" ? (
                          <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                              • {t("discount")}
                            </Text>
                            <Text style={styles.discountText}>
                              - {customerData.symbol} {formatNumberWithComma(customerData.discountReturn)}
                            </Text>
                          </View>
                        ) : null}

                         <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { fontSize: wp("3.5%"), color: "#6B7280", paddingLeft: wp("4%") }]}>
                          • {t("sum")}
                        </Text>
                        <Text style={[styles.detailValue, { fontSize: wp("3.5%"), color: "#6B7280" }]}>
                          {customerData.symbol} {formatNumberWithComma(customerData.subtotalReturn)}
                        </Text>
                      </View>
                      </>
                    )}
                  </>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t("subtotal")}</Text>
                  <Text style={styles.detailValue}>
                    {customerData.symbol}{" "}
                    {formatNumberWithComma(
                        parseFloat(customerData.subtotalReturn || 0)
                    )}
                  </Text>
                </View>

                <View style={styles.divider} />

                    {/* Actions */}
              
                  <View style={styles.detailRow}>
                    <Text style={styles.bookingLabel}>{t("bookingCode")}</Text>
                    <Text style={styles.bookingCode}>{customerData.md_booking_code || "N/A"}</Text>
                  </View>



           
              </View>
       
            ))}

            {success && (
              <View style={styles.card}>


                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t("total")}</Text>
                  <Text style={styles.totalValue}>
                    {customerData.symbol} {formatNumberWithComma(customerData.total)}
                  </Text>
                </View>

                <View style={styles.divider} />


                {/* Rewards / Login Prompt */}
                {isLoggedIn ? (
                  <>
                    <View style={styles.rewardSection}>
                      <View style={styles.rewardHeader}>
                        <Ionicons name="trophy" size={24} color="#FFD700" />
                        <Text style={styles.rewardTitle}>{t("earnedPoints")}</Text>
                      </View>

                      <View style={styles.rewardContainer}>
                        <LinearGradient colors={["#FFD700", "#FFA500"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rewardGradient}>
                          <View style={styles.rewardContent}>
                            <Text style={styles.rewardPoints}>
                              +{customerData.earnedPoints
                                ? parseFloat(customerData.earnedPoints).toFixed(2)
                                : (() => {
                                    const subtotalDepart = parseFloat(customerData.subtotalDepart || 0);
                                    const subtotalReturn = parseFloat(customerData.subtotalReturn || 0);
                                    const totalSubtotal = subtotalDepart + subtotalReturn;
                                    return (totalSubtotal / 100).toFixed(2);
                                  })()}
                            </Text>
                            <Text style={styles.rewardLabel}>{t("points")}</Text>
                          </View>
                          <Ionicons name="star" size={32} color="#FFFFFF" style={{ opacity: 0.8 }} />
                        </LinearGradient>
                      </View>

                      <Text style={styles.rewardNote}>{t("pointsNote")}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.loginPromptSection}>
                      <View style={styles.loginPromptHeader}>
                        <Ionicons name="person-circle-outline" size={24} color="#6B7280" />
                        <Text style={styles.loginPromptTitle}>{t("loginForPoints")}</Text>
                      </View>

                      <View style={styles.loginPromptContainer}>
                        <Text style={styles.loginPromptText}>{t("loginPrompt")}</Text>
                        <Text style={styles.loginPromptSubtext}>{t("loginSubtext")}</Text>
                      </View>
                    </View>
                  </>
                )}
                </View>
            )}


            {!success && (
              <View style={styles.card}>
                <View style={styles.errorCard}>
                  <View style={styles.errorContent}>
                    <Ionicons name="alert-circle-outline" size={48} color="#DC2626" style={{ marginBottom: hp("2%") }} />
                    <Text style={styles.errorTitle}>{t("invalidCard")}</Text>
                    <Text style={styles.errorSubtitle}>{t("contactUs")}</Text>
                    <Text style={styles.errorContact}>{t("email")}: info@thetrago.com</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </LinearGradient>


      
    </SafeAreaView>
  );
};

export default ResultScreen;

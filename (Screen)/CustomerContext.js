import React, { createContext, useState, useContext } from 'react';

// สร้าง Context สำหรับข้อมูลลูกค้า
const CustomerContext = createContext();

// สร้าง Provider สำหรับ Context
export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState({
    // booking infomation ----------------------------------------------------------------------------
    md_booking_memberid: 0, //รหัสสมาชิก
    md_booking_affiliate_id: 0, //รหัสตัวแทน
    md_booking_affiliate_subid: 0, //รหัสตัวแทนย่อย
    md_booking_affiliate_price: 0, //ราคาตัวแทน
    md_booking_code: '', //รหัสการจอง
    md_booking_groupcode: '', //รหัสกลุ่มการจอง
    md_booking_companyid: 0, //รหัสบริษัท
    md_booking_reference: '', //รหัสอ้างอิง
    md_booking_paymentid: '', //รหัสการชำระเงิน
    md_booking_boattypeid: 0, //รหัสประเภทเรือ
    md_booking_country:'', //ประเทศ
    md_booking_countrycode: '', //รหัสประเทศ
    md_booking_round: 1, //ประเภทการเดินทาง
    md_booking_timetableid : 0, //รหัสตารางเวลา
    md_booking_tel: '', //เบอร์โทร
    md_booking_whatsapp: '', //เบอร์ WhatsApp
    md_booking_email: '', //อีเมล
    md_booking_price: 0, //ราคา
    md_booking_total: 0, //ราคารวม
    md_booking_vat: 0, //ภาษีมูลค่าเพิ่ม
    md_booking_paypal:'', //รหัสการชำระเงิน PayPal
    md_booking_refund:'',
    md_booking_refundprice: 0, //ราคารับเงินคืน
    md_booking_credit: 0, //เครดิต
    md_booking_insurance: 0, //ประกันภัย
    md_booking_currency: 'THB', //สกุลเงิน
    md_booking_net: 0, //ราคาสุทธิ
    md_booking_adult: 0, //จำนวนผู้ใหญ่
    md_booking_child: 0, //จำนวนเด็ก
    md_booking_infant: 0, //จำนวนทารก
    md_booking_departdate: '', //วันที่เดินทาง
    md_booking_departtime: '', //เวลาเดินทาง
    md_booking_remark: '', //หมายเหตุ
    md_booking_note: '', //บันทึก
    md_booking_statuspayment: 0, 
    md_booking_status: 0, //สถานะการจอง
    md_booking_pay: 0, //สถานะการชำระเงิน
    md_booking_payfee: 0, //ค่าธรรมเนียมการชำระ
    md_booking_lang: 'en', //ภาษา
    md_booking_from: 0, //มาจาก
    md_booking_sent: '', //ส่งไปยัง
    md_booking_sentbooking: '', //ส่งไปยังการจอง
    md_booking_senttransfer: '', //ส่งไปยังการโอน
    md_booking_device: 2, //อุปกรณ์ที่ใช้
    md_booking_agentid: '',
    md_booking_agentprice: 0, //ราคาตัวแทน
    md_booking_promocode: '', //รหัสโปรโมชั่น
    md_booking_promoprice: 0, //ส่วนลดโปรโมชั่น
    md_booking_crebyid:'', //รหัสผู้สร้าง
    md_booking_updatebyid:'', //รหัสผู้ปรับปรุง
    //------------------------------------------------------------------------------------------------
    bookingcode: '', //รหัสการจอง
    bookingcodegroup: '', //รหัสการจอง
    groupcode: '', //
    Firstname: '', //ชื่อ
    Lastname: '', //นามสกุล
    selectedTitle: 'Please Select', //คำนำหน้า
    selectcoountrycode: 'Please Select',
    tel: '', //เบอร์โทร
    email: '', //อีเมล
    companyDepartId: '', //รหัสบริษัท
    companyReturnId: '', //รหัสบริษัทกลับ
    companyname: '', //ชื่อบริษัท
    startingPointId: '', //รหัสจุดเริ่มต้น
    startingpoint_name: '', //จุดเริ่มต้น
    endPointId: '', //รหัสจุดหมายปลายทาง
    endpoint_name: '', //จุดหมายปลายทาง
    boatypeid: '', //ประเภทเรือ
    country: '', //ประเทศ
    countrycode: 'Please Select', //รหัสประเทศ
    roud: 1, //ประเภทการเดินทาง
    price:'', //ราคา
    total:0, //ราคารวม
    currency:'THB', //สกุลเงิน
    netDepart:'', //ราคาสุทธิ
    adult:0, //จำนวนผู้ใหญ่
    child:0, //จำนวนเด็ก
    infant:0, //จำนวนทารก
    totaladultDepart:0, //รวมราคาจำนวนผู้ใหญ่
    totaladultReturn:0, //รวมราคาจำนวนผู้ใหญ่
    totalchildDepart:0, //รวมราคาจำนวนเด็ก
    totalchildReturn:0, //รวมราคาจำนวนเด็ก
    totalinfantDepart:0, //รวมราคาจำนวนเด็ก
    totalinfantReturn:0, //รวมราคาจำนวนเด็ก
    discountDepart:0, //ส่วนลด
    discountReturn:0, //ส่วนลด
    subtotalDepart:0, //ราคารวม
    subtotalReturn:0, //ราคารวม
    ticketfare:0, //ค่าโดยสาร
    paymenttype:'', //ประเภทการชำระเงิน 
    paymentfee:0, //ค่าธรรมเนียมการชำระ
    day:'', //วัน
    month:'', //เดือน
    year:'', //ปี
    time:'', //เวลา
    date:'', //วันที่
    departdate:'', //วันที่เดินทาง
    returndate:'', //วันที่กลับ
    departtime:'', //เวลาเดินทาง
    ip:'', //ไอพี
    paymentid:'', //รหัสการชำระ
    bookingdate:'', //วันที่จอง
    pickupDepartId:'', //รหัสรถรับส่ง
    pickupReturnId:'', //รหัสรถรับส่งกลับ
    dropoffDepartId:'', //รหัสรถส่ง
    dropoffReturnId:'', //รหัสรถส่งกลับ
    pickupPriceDepart:0, //ราคารถรับส่ง
    pickupPriceReturn:0, //ราคารถรับส่งกลับ
    dropoffPriceDepart:0, //ราคารถส่ง
    dropoffPriceReturn:0, //ราคารถส่งกลับ
    onewaystatus:false, //สถานะเที่ยวเดียว
    roudtripstatus:false, //สถานะไปกลับ
    timeTableDepartId:'', //รหัสตารางเวลาเดินทาง
    departDateTimeTable:'', //วันเวลาเดินทาง
    pierStartDepartId:'', //รหัสท่าเริ่มต้น
    pierStartDepartName:'', //ชื่อท่าเริ่มต้น
    pierEndDepartId:'', //รหัสท่าปลายทาง
    pierStartReturntId:'', //รหัสท่าเริ่มต้นกลับ
    pierEndReturntId:'',
    timeTableReturnId:'', //รหัสตารางเวลากลับ
    tripTypeinput:'',
    piccompanyDepart:'',
    pictimetableDepart:'',
    piccompanyReturn:'',
    pictimetableReturn:'',
    email:'',
    password:'',
    remember:false,
    popdestination: '',
    discount:0,
    exchaneRate:0,
    intervalId: null, 
    international : '0',
    passenger: [
      {
        prefix: '',
        fname: '',
        lname: '',
        idtype: '',
        nationality: '',
        passport: '',
        dateofissue: '',
        passportexpiry: '',
        birthday: '',
        type: ''
      }
    ],
    symbol:'฿', //สัญลักษณ์เงิน
    
  });

  const updateCustomerData = (newData) => {
    setCustomerData((prevData) => ({ ...prevData, ...newData }));
  };

  return (
    <CustomerContext.Provider value={{ customerData, updateCustomerData }}>
      {children}
    </CustomerContext.Provider>
  );
};

// Custom hook เพื่อใช้งาน context
export const useCustomer = () => useContext(CustomerContext);

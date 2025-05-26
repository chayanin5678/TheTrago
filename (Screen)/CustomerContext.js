import React, { createContext, useState, useContext } from 'react';

// สร้าง Context สำหรับข้อมูลลูกค้า
const CustomerContext = createContext();

// สร้าง Provider สำหรับ Context
export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState({
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
    roud: '', //ประเภทการเดินทาง
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
    popdestination: ''

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

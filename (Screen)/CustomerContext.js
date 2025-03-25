import React, { createContext, useState, useContext } from 'react';

// สร้าง Context สำหรับข้อมูลลูกค้า
const CustomerContext = createContext();

// สร้าง Provider สำหรับ Context
export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState({
    bookingcode: '', //รหัสการจอง
    groupcode: '', //
    Firstname: '', //ชื่อ
    Lastname: '', //นามสกุล
    selectedTitle: 'Please Select', //คำนำหน้า
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
    countrycode: '', //รหัสประเทศ
    roud: '', //ประเภทการเดินทาง
    timetableid: '', //รหัสตารางเวลา
    price:'', //ราคา
    total:'', //ราคารวม
    currency:'THB', //สกุลเงิน
    net:'', //ราคาสุทธิ
    adult:0, //จำนวนผู้ใหญ่
    child:0, //จำนวนเด็ก
    infant:0, //จำนวนทารก
    totaladult:'', //รวมราคาจำนวนผู้ใหญ่
    totalchild:'', //รวมราคาจำนวนเด็ก
    discount:'', //ส่วนลด
    ticketfare:'', //ค่าโดยสาร
    subtotal:'', //ราคารวม
    paymentfee:'', //ค่าธรรมเนียมการชำระ
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
    pickupprice:0, //ราคารถรับส่ง
    dropoffprice:0, //ราคารถส่ง
    onewaystatus:false, //สถานะเที่ยวเดียว
    roudtripstatus:false, //สถานะไปกลับ
    timeTableDepartId:'', //รหัสตารางเวลาเดินทาง
    departDateTimeTable:'', //วันเวลาเดินทาง
    pierStartDepartId:'', //รหัสท่าเริ่มต้น
    pierEndDepartId:'', //รหัสท่าปลายทาง
    pierStartReturntId:'', //รหัสท่าเริ่มต้นกลับ
    pierEndReturntId:'',
    timeTableReturnId:'', //รหัสตารางเวลากลับ
    tripTypeinput:'',
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

import React, { createContext, useState, useContext } from 'react';

// สร้าง Context สำหรับข้อมูลลูกค้า
const CustomerContext = createContext();

// สร้าง Provider สำหรับ Context
export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState({
    bookingcode: '',
    groupcode: '',
    Firstname: '',
    Lastname: '',
    selectedTitle: 'Please Select',
    tel: '',
    email: '',
    companyid: '',
    companyname: '',
    startingpoint_name: '',
    endpoint_name: '',
    boatypeid: '',
    country: '',
    countrycode: '',
    roud: '',
    timetableid: '',
    email:'',
    price:'',
    total:'',
    currency:'THB',
    net:'',
    adult:0,
    child:0,
    infant:0,
    totaladult:'',
    totalchild:'',
    discount:'',
    ticketfare:'',
    subtotal:'',
    paymentfee:'',
    total:'',
    day:'',
    month:'',
    year:'',
    time:'',
    date:'',
    departdate:'',
    departtime:'',
    ip:'',
    paymentid:'',
    bookingdate:'',
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

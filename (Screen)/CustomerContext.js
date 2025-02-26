import React, { createContext, useState, useContext } from 'react';

// สร้าง Context สำหรับข้อมูลลูกค้า
const CustomerContext = createContext();

// สร้าง Provider สำหรับ Context
export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState({
    Firstname: '',
    Lastname: '',
    selectedTitle: 'Please Select',
    mobileNumber: '',
    email: '',
    companyid: '',
    companyname: '',
    startingpoint_name: '',
    endpoint_name: '',
    boatpeid: '',
    country: '',
    countrycode: '',
    roumd: '',
    timetable: '',
    tel: '',
    email:'',
    price:'',
    total:'',
    currency:'',
    net:'',
    adult:'',
    child:'',
    infant:'',
    day:'',
    month:'',
    year:'',
    time:'',
    date:'',
    departtime:'',
    ip:'',
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

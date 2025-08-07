import React, { createContext, useContext, useState, useEffect } from 'react';
import ipAddress from '../config/ipconfig';

export const PromotionContext = createContext([]);

export const PromotionProvider = ({ children }) => {
  const [promotionData, setPromotionData] = useState([]);

  useEffect(() => {
    fetch(`${ipAddress}/promotion`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setPromotionData(data.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <PromotionContext.Provider value={promotionData}>
      {children}
    </PromotionContext.Provider>
  );
};

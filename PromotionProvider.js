import React, { createContext, useEffect, useState } from 'react';
import ipAddress from './ipconfig';

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

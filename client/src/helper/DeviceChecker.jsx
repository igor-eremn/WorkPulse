import React, { useEffect, useState } from 'react';

const DeviceChecker = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'
      ];
      
      const isMobileWidth = window.innerWidth <= 768;
      
      const hasMobileKeywords = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      );
      
      setIsMobile(isMobileWidth || hasMobileKeywords);
    };

    checkMobile();
  }, []);

  if (isMobile) {
    return (
      <div className="device-checker-container">
        <div className="device-checker-title">
          Desktop Access Required
        </div>
        <div className="device-checker-message">
          Please use a desktop computer to access this application. Mobile access is currently restricted for regular users.
        </div>
      </div>
    );
  }

  return children;
};

export default DeviceChecker;
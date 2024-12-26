import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
      <Alert variant="destructive">
        <AlertTitle>Desktop Access Required</AlertTitle>
        <AlertDescription>
          Please use a desktop computer to access this application. Mobile access is currently restricted for regular users.
        </AlertDescription>
      </Alert>
    );
  }

  return children;
};
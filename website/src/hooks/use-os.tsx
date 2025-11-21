import { useState, useEffect } from 'react';

export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'unknown';

export const useOS = (): OperatingSystem => {
  const [os, setOS] = useState<OperatingSystem>('unknown');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (userAgent.includes('win')) {
      setOS('windows');
    } else if (userAgent.includes('mac')) {
      setOS('macos');
    } else if (userAgent.includes('linux')) {
      setOS('linux');
    }
  }, []);

  return os;
};

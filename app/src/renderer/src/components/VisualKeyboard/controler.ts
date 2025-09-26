import React, { useEffect, useState } from 'react';
import { KeyPressInfo } from './Model';
import { normalizeKey } from '../VisualKeyboardUtil';

export const useKeyboardController = () => {
  const [keyState, setKeyState] = useState<KeyPressInfo>({
    isDown: false,
    key: ''
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setKeyState({
        isDown: true,
        key: normalizeKey(event)
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeyState({
        isDown: false,
        key: normalizeKey(event)
      });
    };

    const handleBlur = () => {
      setKeyState({
        isDown: false,
        key: ''
      });
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleBlur, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleBlur, { capture: true });
    };
  }, []);

  return keyState;
};

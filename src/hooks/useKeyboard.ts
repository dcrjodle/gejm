import { useEffect, useRef } from 'react';

export const useKeyboard = () => {
  const keysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysRef.current[key] = true;
      
      // Prevent default for game keys
      if (['w', 'a', 's', 'd', ' '].includes(key)) {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysRef.current[key] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keysRef;
};
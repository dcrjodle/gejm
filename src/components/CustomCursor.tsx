import React, { useEffect, useRef } from 'react';
import styles from '../styles/CustomCursor.module.scss';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Center the 4px dot at the mouse position (offset by 2px = half the width/height)
        cursorRef.current.style.left = `${e.clientX - 2}px`;
        cursorRef.current.style.top = `${e.clientY - 2}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={styles.cursor}
      style={{
        left: 0,
        top: 0,
      }}
    />
  );
};

export default CustomCursor;
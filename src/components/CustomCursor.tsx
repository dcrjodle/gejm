import React, { useEffect, useRef } from 'react';
import styles from '../styles/CustomCursor.module.scss';

interface CursorPosition {
  x: number;
  y: number;
}

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const positionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const trailPositions = useRef<CursorPosition[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let isMoving = false;

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      
      if (!isMoving) {
        isMoving = true;
        updateCursor();
      }
    };

    const updateCursor = () => {
      const currentPos = positionRef.current;
      
      // Update main cursor position immediately
      if (cursorRef.current) {
        cursorRef.current.style.left = `${currentPos.x}px`;
        cursorRef.current.style.top = `${currentPos.y}px`;
      }

      // Update trail with interpolation for smoother effect
      trailPositions.current.unshift({ ...currentPos });
      if (trailPositions.current.length > 6) {
        trailPositions.current = trailPositions.current.slice(0, 6);
      }

      // Update trail elements
      trailRefs.current.forEach((trailElement, index) => {
        if (trailElement && trailPositions.current[index + 1]) {
          const pos = trailPositions.current[index + 1];
          const opacity = (6 - index) / 6 * 0.6;
          const scale = (6 - index) / 6 * 0.8;
          
          trailElement.style.left = `${pos.x}px`;
          trailElement.style.top = `${pos.y}px`;
          trailElement.style.opacity = opacity.toString();
          trailElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
      });

      animationFrameRef.current = requestAnimationFrame(() => {
        isMoving = false;
      });
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Fire trail - Static elements that get updated via refs */}
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) trailRefs.current[index] = el;
          }}
          className={styles.trailDot}
          style={{
            left: 0,
            top: 0,
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0)',
          }}
        />
      ))}
      
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className={styles.cursor}
        style={{
          left: 0,
          top: 0,
        }}
      />
    </>
  );
};

export default CustomCursor;
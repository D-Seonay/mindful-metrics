import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle keyboard controls.
 * @param callback Function to execute when a target key is pressed.
 * @param keys Array of keys to listen for (default: Space and Enter).
 */
export const useKeyboardControls = (
  callback: () => void,
  keys: string[] = [' ', 'Enter']
) => {
  const callbackRef = useRef(callback);
  
  // Update the ref each render so the listener always calls the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        if (event.repeat) return; // Prevent holding the key
        event.preventDefault(); // Prevent default browser behavior (e.g. scrolling)
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(keys)]); // Ensure effect only runs if keys actually change by value
};

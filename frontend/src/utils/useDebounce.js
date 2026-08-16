import { useState, useEffect } from 'react';

/**
 * useDebounce Custom Hook
 * 
 * What it does:
 * - Delays updating a state value until the user stops typing for a specified delay (e.g. 300ms).
 * 
 * Why it is needed:
 * - Prevents firing an HTTP API request on every single keystroke in the search bar.
 * - Improves app performance and reduces server load.
 * 
 * @param {any} value - The input value to debounce (e.g. search query).
 * @param {number} delay - Delay in milliseconds (default: 300ms).
 * @returns {any} Debounced value.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timer to update debounced value after specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timer if value changes before delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

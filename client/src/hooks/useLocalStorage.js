import { useState, useEffect } from "react";


const useLocalStorage = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    const initial = stored ? JSON.parse(stored) : defaultValue;
    console.log(initial)
    const [value, setValue] = useState(initial);
  
    useEffect(() => {
      if (!value) localStorage.clear()
      else localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
  
    return [value, setValue];
  }
export default useLocalStorage
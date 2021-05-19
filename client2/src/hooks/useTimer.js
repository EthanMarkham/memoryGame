import { useEffect, useState } from 'react';

const useTimer = (seconds, callback) => {
  const [time, setTime] = useState(seconds * 1000)
  const [enabled, toggleTimer] = useState(false);

  var initialDate;
  var interval;
  var currentTime = time;

  const decreaseTime = _ => {
    currentTime -= 100;
    
    if (currentTime <= 0) {
      setTime(0);
      toggleTimer(false);
      callback();
    }

    else setTime(currentTime);
  }

  useEffect(() => {
    if (enabled) {
      interval = setInterval(() => {
        decreaseTime();
      }, 100);
    }
    else {
      clearInterval(interval);
    }
    return _ => clearInterval(interval);
  }, [enabled]);

  return [time, toggleTimer];
}
export default useTimer;
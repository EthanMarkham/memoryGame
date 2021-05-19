const CountdownTimer = ({ current, total, size, running }) => {
  const milliseconds = total * 1000;
  const radius = size / 2;
  const circumference = size * Math.PI;
  const strokeDashoffset = () => circumference - (current / milliseconds) * circumference;

  const seconds = (current / 1000).toFixed();
  return (
    <div className='timer'>
      <label>timer</label>
      <div className='clock'>
        <p>{seconds}</p>
        <svg style={{ width: size, height: size }}>
          <circle
            className="timer-back"
            cx={radius}
            cy={radius}
            r={radius}
            fill="none"
          ></circle>
        </svg>
        <svg style={{ width: size, height: size }}>
          <circle
            className="timer-front"
            strokeDasharray={circumference}
            strokeDashoffset={
              running ? strokeDashoffset() : 0
            }
            r={radius}
            cx={radius}
            cy={radius}
            fill="none"
            strokeLinecap="round"
          ></circle>
        </svg>
      </div>
    </div>
  );
}

export default CountdownTimer;


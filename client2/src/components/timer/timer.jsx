const CountdownTimer = ({ current, total, size, running }) => {
  if (running) {
    const milliseconds = total * 1000;
    const radius = size / 2;
    const circumference = size * Math.PI;
    const strokeDashoffset = () => circumference - (current / milliseconds) * circumference;

    const seconds = (current / 1000).toFixed();
    return (
      <div className='timer'>
        <div className='clock'>
          <p>{seconds}s</p>
          <svg style={{ width: size, height: size }}>
            <circle
              className="timer-back"
              cx={radius}
              cy={radius}
              r={radius}
              fill="#758d9c" //prim4 
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
  else return null;
}


export default CountdownTimer;


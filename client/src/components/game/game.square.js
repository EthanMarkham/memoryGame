var React = require('react');

function Square(props) {
  return (
      <button 
        className="square" 
        onClick={props.handleClick}
        style={props.style}
        disabled={props.disableClick()}  
      >
        <img 
          src={`http://localhost:5000/${props.image}`} 
          alt={props.civ}
          className="image"
          />
        {props.showLabels && <label>{props.civ}</label>}
      </button>
  );
}

export default Square;

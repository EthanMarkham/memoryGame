var React = require('react');

function Square(props) {
  return (
      <button 
        className="square" 
        onClick={props.onClick}
        style={props.style}>
        <img 
          src={props.image} 
          alt={props.civ}
          className="image"
          />
        {props.showLabels && <label>{props.civ}</label>}
      </button>
  );
}

export default Square;

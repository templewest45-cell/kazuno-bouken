import React from 'react';
import './BalanceScale.css';

export default function BalanceScale({ leftCount = 0, rightCount = 0, leftArea, rightArea }) {
  // Calculate angle based on counts
  let angle = 0;
  if (leftCount > rightCount) {
    angle = -14;
  } else if (rightCount > leftCount) {
    angle = 14;
  }

  return (
    <div className="balance-scale-wrapper">
      <div className="pillar"></div>
      <div className="pillar-base"></div>
      
      <div className="beam-group" style={{ transform: `rotate(${angle}deg)` }}>
        <div className="beam"></div>
        <div className="pivot"></div>
        
        {/* Left Side */}
        <div className="wire-container left" style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="wires">
            <div className="wire-line left-wire"></div>
            <div className="wire-line right-wire"></div>
          </div>
          <div className="pan">
            <div className="pan-items">
              {leftArea}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="wire-container right" style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="wires">
            <div className="wire-line left-wire"></div>
            <div className="wire-line right-wire"></div>
          </div>
          <div className="pan">
            <div className="pan-items">
              {rightArea}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

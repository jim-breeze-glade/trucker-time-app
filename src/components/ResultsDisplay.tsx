import React from 'react';
import { RouteEstimate } from '../types';
import { formatTime } from '../utils/dotCalculations';

interface ResultsDisplayProps {
  estimate: RouteEstimate | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ estimate }) => {
  if (!estimate) return null;

  return (
    <div className={`results-display ${!estimate.isLegal ? 'violation' : ''}`}>
      {!estimate.isLegal && (
        <div className="alert">
          <h3>⚠️ DOT VIOLATION ALERT</h3>
          <p>This load cannot be delivered legally due to:</p>
          <ul>
            {estimate.violations.map((violation, index) => (
              <li key={index}>{violation}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="results-grid">
        <div className="result-section">
          <h3>Route Details</h3>
          <div className="result-item">
            <span>Distance to Pickup:</span>
            <span>{estimate.pickupDistance.toFixed(1)} miles</span>
          </div>
          <div className="result-item">
            <span>Driving Time to Pickup:</span>
            <span>{estimate.pickupDrivingTime.toFixed(1)} hours</span>
          </div>
          <div className="result-item">
            <span>Distance to Delivery:</span>
            <span>{estimate.deliveryDistance.toFixed(1)} miles</span>
          </div>
          <div className="result-item">
            <span>Driving Time to Delivery:</span>
            <span>{estimate.deliveryDrivingTime.toFixed(1)} hours</span>
          </div>
        </div>

        <div className="result-section">
          <h3>Time Summary</h3>
          <div className="result-item">
            <span>Total Driving Time:</span>
            <span>{estimate.totalDrivingTime.toFixed(1)} hours</span>
          </div>
          <div className="result-item">
            <span>Total Time (with loading):</span>
            <span>{estimate.totalTime.toFixed(1)} hours</span>
          </div>
          <div className="result-item">
            <span>Estimated Arrival:</span>
            <span>{formatTime(estimate.estimatedArrivalTime)}</span>
          </div>
        </div>

        <div className="result-section">
          <h3>Hours Remaining</h3>
          <div className="result-item">
            <span>DOT Hours Remaining:</span>
            <span className={estimate.hoursRemaining < 2 ? 'warning' : ''}>
              {estimate.hoursRemaining.toFixed(1)} hours
            </span>
          </div>
          <div className="result-item">
            <span>Time Buffer:</span>
            <span className={estimate.timeRemaining < 1 ? 'warning' : ''}>
              {estimate.timeRemaining > 0 
                ? `${estimate.timeRemaining.toFixed(1)} hours early`
                : `${Math.abs(estimate.timeRemaining).toFixed(1)} hours late`}
            </span>
          </div>
        </div>
      </div>

      {estimate.isLegal && (
        <div className="success-message">
          ✅ This load can be delivered legally within DOT regulations
        </div>
      )}
    </div>
  );
};
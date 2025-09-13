import React, { useState } from 'react';
import './App.css';
import { LocationInput } from './components/LocationInput';
import { TimeInput } from './components/TimeInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadDetails, RouteEstimate } from './types';
import { calculateRoute } from './utils/dotCalculations';

function App() {
  const [loadDetails, setLoadDetails] = useState<LoadDetails>({
    currentLocation: {},
    currentTime: '',
    pickupLocation: {},
    pickupTime: '',
    estimatedLoadingTime: 30,
    deliveryLocation: {},
    deliveryTime: '',
    dotHoursAvailable: 11,
    dotHoursUsed: 0
  });

  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const validateAndCalculate = () => {
    const newErrors: string[] = [];

    if (!loadDetails.currentLocation.lat || !loadDetails.currentLocation.lng) {
      newErrors.push('Current location is required');
    }
    if (!loadDetails.pickupLocation.lat || !loadDetails.pickupLocation.lng) {
      newErrors.push('Pickup location is required');
    }
    if (!loadDetails.deliveryLocation.lat || !loadDetails.deliveryLocation.lng) {
      newErrors.push('Delivery location is required');
    }
    if (loadDetails.currentTime.length !== 4) {
      newErrors.push('Current time must be 4 digits (HHMM)');
    }
    if (loadDetails.pickupTime.length !== 4) {
      newErrors.push('Pickup time must be 4 digits (HHMM)');
    }
    if (loadDetails.deliveryTime.length !== 4) {
      newErrors.push('Delivery time must be 4 digits (HHMM)');
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      const result = calculateRoute(loadDetails);
      setEstimate(result);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OTR Trucker Time Management</h1>
        <p>Estimate delivery times and ensure DOT compliance</p>
      </header>

      <main className="App-main">
        <div className="form-container">
          <section className="form-section">
            <h2>Current Status</h2>
            <LocationInput
              label="Current Location"
              value={loadDetails.currentLocation}
              onChange={(location) => setLoadDetails({...loadDetails, currentLocation: location})}
              allowDeviceLocation={true}
            />
            <TimeInput
              label="Current Time"
              value={loadDetails.currentTime}
              onChange={(time) => setLoadDetails({...loadDetails, currentTime: time})}
            />
          </section>

          <section className="form-section">
            <h2>Pickup Details</h2>
            <LocationInput
              label="Pickup Location"
              value={loadDetails.pickupLocation}
              onChange={(location) => setLoadDetails({...loadDetails, pickupLocation: location})}
            />
            <TimeInput
              label="Pickup Time"
              value={loadDetails.pickupTime}
              onChange={(time) => setLoadDetails({...loadDetails, pickupTime: time})}
            />
            <div className="input-group">
              <label>Estimated Loading Time (minutes)</label>
              <input
                type="number"
                value={loadDetails.estimatedLoadingTime}
                onChange={(e) => setLoadDetails({
                  ...loadDetails, 
                  estimatedLoadingTime: parseInt(e.target.value) || 0
                })}
                min="0"
                max="480"
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Delivery Details</h2>
            <LocationInput
              label="Delivery Location"
              value={loadDetails.deliveryLocation}
              onChange={(location) => setLoadDetails({...loadDetails, deliveryLocation: location})}
            />
            <TimeInput
              label="Delivery Deadline"
              value={loadDetails.deliveryTime}
              onChange={(time) => setLoadDetails({...loadDetails, deliveryTime: time})}
            />
          </section>

          <section className="form-section">
            <h2>DOT Hours of Service</h2>
            <div className="input-group">
              <label>Hours Available Today</label>
              <input
                type="number"
                value={loadDetails.dotHoursAvailable}
                onChange={(e) => setLoadDetails({
                  ...loadDetails, 
                  dotHoursAvailable: parseFloat(e.target.value) || 0
                })}
                min="0"
                max="11"
                step="0.5"
              />
            </div>
            <div className="input-group">
              <label>Hours Already Used Today</label>
              <input
                type="number"
                value={loadDetails.dotHoursUsed}
                onChange={(e) => setLoadDetails({
                  ...loadDetails, 
                  dotHoursUsed: parseFloat(e.target.value) || 0
                })}
                min="0"
                max="14"
                step="0.5"
              />
            </div>
          </section>

          {errors.length > 0 && (
            <div className="errors">
              {errors.map((error, index) => (
                <div key={index} className="error">{error}</div>
              ))}
            </div>
          )}

          <button className="calculate-btn" onClick={validateAndCalculate}>
            Calculate Route & Check Compliance
          </button>
        </div>

        <ResultsDisplay estimate={estimate} />
      </main>
    </div>
  );
}

export default App;

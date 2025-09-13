import React, { useState } from 'react';
import './App.css';

interface TripDetails {
  currentDateTime: string;
  currentTimezone: string;
  pickupDateTime: string;
  pickupTimezone: string;
  deliveryDateTime: string;
  deliveryTimezone: string;
  estimatedMph: number;
  distanceMiles: number;
  // Current HOS status
  hoursDrivernToday: number;
  hoursOnDutyToday: number;
  hoursIntoCurrentCycle: number; // 70 hours in 8 days
  lastRestBreakHoursAgo: number;
}

interface TripBreakdown {
  totalDrivingTimeHours: number;
  canMakeOnTime: boolean;
  daysNeeded: number;
  requiredRestStops: RestStop[];
  remainingTimeAfterDriving: number;
  timeShortfall: number;
  hoursAvailableToday: number;
  requiresImmediateRest: boolean;
  hosViolations: string[];
}

interface RestStop {
  day: number;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
}

// US Time zones
const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: -9 },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: -10 },
];

function App() {
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    currentDateTime: new Date().toISOString().slice(0, 16),
    currentTimezone: 'America/New_York',
    pickupDateTime: '',
    pickupTimezone: 'America/New_York',
    deliveryDateTime: '',
    deliveryTimezone: 'America/New_York',
    estimatedMph: 60,
    distanceMiles: 500,
    hoursDrivernToday: 0,
    hoursOnDutyToday: 0,
    hoursIntoCurrentCycle: 0,
    lastRestBreakHoursAgo: 0,
  });

  const [tripBreakdown, setTripBreakdown] = useState<TripBreakdown | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const formatDateTimeWithTimezone = (dateTimeString: string, timezone: string): string => {
    if (!dateTimeString) return '';
    
    // Create date in local time
    const date = new Date(dateTimeString);
    
    // Get timezone info
    const tzInfo = timezones.find(tz => tz.value === timezone);
    const tzLabel = tzInfo ? tzInfo.label.match(/\(([^)]+)\)/)?.[1] || tzInfo.label : timezone;
    
    // Format the date
    const formatted = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    return `${formatted} ${tzLabel}`;
  };

  const convertToUTC = (dateTimeString: string, timezone: string): Date => {
    // This is a simplified conversion - in production, you'd use a library like date-fns-tz
    const date = new Date(dateTimeString);
    const tzInfo = timezones.find(tz => tz.value === timezone);
    if (tzInfo) {
      // Adjust for timezone offset
      const offsetMs = tzInfo.offset * 60 * 60 * 1000;
      return new Date(date.getTime() - offsetMs);
    }
    return date;
  };

  const calculateTripBreakdown = (): void => {
    const newErrors: string[] = [];

    // Validation
    if (!tripDetails.currentDateTime) {
      newErrors.push('Current date/time is required');
    }
    if (!tripDetails.pickupDateTime) {
      newErrors.push('Pickup date/time is required');
    }
    if (!tripDetails.deliveryDateTime) {
      newErrors.push('Delivery date/time is required');
    }
    if (tripDetails.estimatedMph <= 0 || tripDetails.estimatedMph > 80) {
      newErrors.push('Average MPH must be between 1 and 80');
    }
    if (tripDetails.distanceMiles <= 0) {
      newErrors.push('Distance must be greater than 0');
    }
    if (tripDetails.hoursDrivernToday < 0 || tripDetails.hoursDrivernToday > 11) {
      newErrors.push('Hours driven today must be between 0 and 11');
    }
    if (tripDetails.hoursOnDutyToday < 0 || tripDetails.hoursOnDutyToday > 14) {
      newErrors.push('Hours on duty today must be between 0 and 14');
    }
    if (tripDetails.hoursIntoCurrentCycle < 0 || tripDetails.hoursIntoCurrentCycle > 70) {
      newErrors.push('Hours in current cycle must be between 0 and 70');
    }

    // Convert times to UTC for calculation
    const currentTime = convertToUTC(tripDetails.currentDateTime, tripDetails.currentTimezone);
    const pickupTime = convertToUTC(tripDetails.pickupDateTime, tripDetails.pickupTimezone);
    const deliveryTime = convertToUTC(tripDetails.deliveryDateTime, tripDetails.deliveryTimezone);

    if (pickupTime <= currentTime) {
      newErrors.push('Pickup time must be after current time');
    }
    if (deliveryTime <= pickupTime) {
      newErrors.push('Delivery time must be after pickup time');
    }

    setErrors(newErrors);

    if (newErrors.length > 0) {
      setTripBreakdown(null);
      return;
    }

    // HOS Regulations
    const maxDrivingPerDay = 11;
    const maxOnDutyPerDay = 14;
    const requiredRestHours = 10;
    const maxWeeklyCycle = 70; // 70 hours in 8 days
    const required30MinBreakAfter = 8; // 30-min break after 8 hours driving

    // Calculate current HOS availability
    const hoursAvailableToday = Math.min(
      maxDrivingPerDay - tripDetails.hoursDrivernToday,
      maxOnDutyPerDay - tripDetails.hoursOnDutyToday,
      maxWeeklyCycle - tripDetails.hoursIntoCurrentCycle
    );

    // Check if immediate rest is required
    const requiresImmediateRest = 
      tripDetails.hoursDrivernToday >= maxDrivingPerDay ||
      tripDetails.hoursOnDutyToday >= maxOnDutyPerDay ||
      tripDetails.lastRestBreakHoursAgo >= required30MinBreakAfter;

    // HOS violations check
    const hosViolations: string[] = [];
    if (tripDetails.hoursDrivernToday > maxDrivingPerDay) {
      hosViolations.push(`Already exceeded 11-hour driving limit (${tripDetails.hoursDrivernToday} hours)`);
    }
    if (tripDetails.hoursOnDutyToday > maxOnDutyPerDay) {
      hosViolations.push(`Already exceeded 14-hour on-duty limit (${tripDetails.hoursOnDutyToday} hours)`);
    }
    if (tripDetails.hoursIntoCurrentCycle >= maxWeeklyCycle) {
      hosViolations.push(`At or exceeded 70-hour/8-day limit (${tripDetails.hoursIntoCurrentCycle} hours)`);
    }
    if (tripDetails.lastRestBreakHoursAgo >= required30MinBreakAfter) {
      hosViolations.push(`Need 30-minute break (${tripDetails.lastRestBreakHoursAgo} hours since last break)`);
    }

    // Calculate trip breakdown
    const totalDrivingTimeHours = tripDetails.distanceMiles / tripDetails.estimatedMph;
    const availableTimeHours = (deliveryTime.getTime() - pickupTime.getTime()) / (1000 * 60 * 60);
    
    // Account for current HOS in calculation
    let remainingDrivingTime = totalDrivingTimeHours;
    let currentCalculationTime = new Date(pickupTime);
    let day = 1;
    let currentDayDriving = requiresImmediateRest ? 0 : hoursAvailableToday;
    
    const restStops: RestStop[] = [];

    // If immediate rest is required, add it first
    if (requiresImmediateRest) {
      const restStartTime = new Date(pickupTime);
      const restEndTime = new Date(restStartTime.getTime() + (requiredRestHours * 60 * 60 * 1000));
      
      restStops.push({
        day: 0,
        startTime: restStartTime.toLocaleString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        endTime: restEndTime.toLocaleString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        duration: requiredRestHours,
        reason: 'Immediate rest required due to current HOS'
      });

      currentCalculationTime = restEndTime;
      currentDayDriving = maxDrivingPerDay; // Fresh hours after rest
    }

    // Calculate rest stops for remaining driving
    while (remainingDrivingTime > 0) {
      const drivingTimeThisDay = Math.min(remainingDrivingTime, currentDayDriving);
      remainingDrivingTime -= drivingTimeThisDay;
      
      if (remainingDrivingTime > 0) {
        // Need a rest stop
        const endDrivingTime = new Date(currentCalculationTime.getTime() + (drivingTimeThisDay * 60 * 60 * 1000));
        const restStartTime = new Date(endDrivingTime);
        const restEndTime = new Date(restStartTime.getTime() + (requiredRestHours * 60 * 60 * 1000));
        
        restStops.push({
          day: day,
          startTime: restStartTime.toLocaleString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          endTime: restEndTime.toLocaleString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          duration: requiredRestHours,
          reason: '10-hour mandatory rest break'
        });

        currentCalculationTime = restEndTime;
        currentDayDriving = maxDrivingPerDay; // Reset for next day
        day++;
      }
    }

    // Calculate days needed
    const daysNeeded = Math.ceil((totalDrivingTimeHours + (requiresImmediateRest ? maxDrivingPerDay - hoursAvailableToday : 0)) / maxDrivingPerDay);

    // Calculate total time needed including rest stops
    const totalTimeNeededHours = totalDrivingTimeHours + (restStops.length * requiredRestHours);
    const canMakeOnTime = totalTimeNeededHours <= availableTimeHours && hosViolations.length === 0;
    const remainingTimeAfterDriving = availableTimeHours - totalTimeNeededHours;
    const timeShortfall = canMakeOnTime ? 0 : totalTimeNeededHours - availableTimeHours;

    setTripBreakdown({
      totalDrivingTimeHours,
      canMakeOnTime,
      daysNeeded,
      requiredRestStops: restStops,
      remainingTimeAfterDriving,
      timeShortfall,
      hoursAvailableToday,
      requiresImmediateRest,
      hosViolations
    });
  };

  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(Math.abs(hours));
    const minutes = Math.round((Math.abs(hours) - wholeHours) * 60);
    return `${hours < 0 ? '-' : ''}${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Day Delivery Estimation with HOS Tracking</h1>
        <p>Plan your delivery schedule with DOT compliance and timezone support</p>
      </header>

      <main className="App-main">
        <div className="form-container">
          <section className="form-section">
            <h2>Current HOS Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Hours Driven Today</label>
                <input
                  type="number"
                  value={tripDetails.hoursDrivernToday}
                  onChange={(e) => setTripDetails({
                    ...tripDetails, 
                    hoursDrivernToday: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  max="11"
                  step="0.5"
                  placeholder="0-11 hours"
                />
                <div className="coords">Max: 11 hours per day</div>
              </div>
              
              <div className="input-group">
                <label>Hours On-Duty Today</label>
                <input
                  type="number"
                  value={tripDetails.hoursOnDutyToday}
                  onChange={(e) => setTripDetails({
                    ...tripDetails, 
                    hoursOnDutyToday: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  max="14"
                  step="0.5"
                  placeholder="0-14 hours"
                />
                <div className="coords">Max: 14 hours per day</div>
              </div>
              
              <div className="input-group">
                <label>Hours in Current 8-Day Cycle</label>
                <input
                  type="number"
                  value={tripDetails.hoursIntoCurrentCycle}
                  onChange={(e) => setTripDetails({
                    ...tripDetails, 
                    hoursIntoCurrentCycle: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  max="70"
                  step="0.5"
                  placeholder="0-70 hours"
                />
                <div className="coords">Max: 70 hours in 8 days</div>
              </div>
              
              <div className="input-group">
                <label>Hours Since Last Break</label>
                <input
                  type="number"
                  value={tripDetails.lastRestBreakHoursAgo}
                  onChange={(e) => setTripDetails({
                    ...tripDetails, 
                    lastRestBreakHoursAgo: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  max="14"
                  step="0.5"
                  placeholder="Hours since 30-min break"
                />
                <div className="coords">30-min break required after 8 hours</div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Trip Timeline</h2>
            <div className="input-group">
              <label>Current Date & Time</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="datetime-local"
                  value={tripDetails.currentDateTime}
                  onChange={(e) => setTripDetails({...tripDetails, currentDateTime: e.target.value})}
                  style={{ flex: 1 }}
                />
                <select
                  value={tripDetails.currentTimezone}
                  onChange={(e) => setTripDetails({...tripDetails, currentTimezone: e.target.value})}
                  style={{ width: '200px' }}
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div className="time-display">{formatDateTimeWithTimezone(tripDetails.currentDateTime, tripDetails.currentTimezone)}</div>
            </div>
            
            <div className="input-group">
              <label>Pickup Date & Time</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="datetime-local"
                  value={tripDetails.pickupDateTime}
                  onChange={(e) => setTripDetails({...tripDetails, pickupDateTime: e.target.value})}
                  style={{ flex: 1 }}
                />
                <select
                  value={tripDetails.pickupTimezone}
                  onChange={(e) => setTripDetails({...tripDetails, pickupTimezone: e.target.value})}
                  style={{ width: '200px' }}
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div className="time-display">{formatDateTimeWithTimezone(tripDetails.pickupDateTime, tripDetails.pickupTimezone)}</div>
            </div>
            
            <div className="input-group">
              <label>Delivery Deadline</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="datetime-local"
                  value={tripDetails.deliveryDateTime}
                  onChange={(e) => setTripDetails({...tripDetails, deliveryDateTime: e.target.value})}
                  style={{ flex: 1 }}
                />
                <select
                  value={tripDetails.deliveryTimezone}
                  onChange={(e) => setTripDetails({...tripDetails, deliveryTimezone: e.target.value})}
                  style={{ width: '200px' }}
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div className="time-display">{formatDateTimeWithTimezone(tripDetails.deliveryDateTime, tripDetails.deliveryTimezone)}</div>
            </div>
          </section>

          <section className="form-section">
            <h2>Trip Parameters</h2>
            <div className="input-group">
              <label>Estimated Average Speed (MPH)</label>
              <input
                type="number"
                value={tripDetails.estimatedMph}
                onChange={(e) => setTripDetails({
                  ...tripDetails, 
                  estimatedMph: parseInt(e.target.value) || 0
                })}
                min="1"
                max="80"
                placeholder="Average speed including stops"
              />
              <div className="coords">Typical highway speeds: 55-65 MPH including fuel stops</div>
            </div>
            
            <div className="input-group">
              <label>Total Distance (Miles)</label>
              <input
                type="number"
                value={tripDetails.distanceMiles}
                onChange={(e) => setTripDetails({
                  ...tripDetails, 
                  distanceMiles: parseInt(e.target.value) || 0
                })}
                min="1"
                placeholder="Total miles to destination"
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

          <button className="calculate-btn" onClick={calculateTripBreakdown}>
            Calculate Trip & Check DOT Compliance
          </button>
        </div>

        {tripBreakdown && (
          <div className={`results-display ${!tripBreakdown.canMakeOnTime ? 'violation' : ''}`}>
            {tripBreakdown.hosViolations.length > 0 && (
              <div className="alert" style={{ backgroundColor: '#ff4444', color: 'white' }}>
                <h3>HOS Violations Detected</h3>
                {tripBreakdown.hosViolations.map((violation, index) => (
                  <p key={index}><strong>{violation}</strong></p>
                ))}
              </div>
            )}

            {!tripBreakdown.canMakeOnTime && tripBreakdown.hosViolations.length === 0 && (
              <div className="alert">
                <h3>Delivery Timeline Alert</h3>
                <p>The delivery cannot be made on time with DOT compliance.</p>
                <p><strong>Time shortfall: {formatHours(tripBreakdown.timeShortfall)}</strong></p>
              </div>
            )}

            <div className="results-grid">
              <div className="result-section">
                <h3>Trip Overview</h3>
                <div className="result-item">
                  <span>Total Driving Time:</span>
                  <span>{formatHours(tripBreakdown.totalDrivingTimeHours)}</span>
                </div>
                <div className="result-item">
                  <span>Days Required:</span>
                  <span>{tripBreakdown.daysNeeded} day{tripBreakdown.daysNeeded > 1 ? 's' : ''}</span>
                </div>
                <div className="result-item">
                  <span>Can Make Deadline:</span>
                  <span className={tripBreakdown.canMakeOnTime ? '' : 'warning'}>
                    {tripBreakdown.canMakeOnTime ? 'Yes' : 'No'}
                  </span>
                </div>
                {tripBreakdown.canMakeOnTime && (
                  <div className="result-item">
                    <span>Extra Time Available:</span>
                    <span>{formatHours(tripBreakdown.remainingTimeAfterDriving)}</span>
                  </div>
                )}
              </div>

              <div className="result-section">
                <h3>Current HOS Impact</h3>
                <div className="result-item">
                  <span>Hours Available Today:</span>
                  <span className={tripBreakdown.hoursAvailableToday <= 2 ? 'warning' : ''}>
                    {formatHours(tripBreakdown.hoursAvailableToday)}
                  </span>
                </div>
                <div className="result-item">
                  <span>Immediate Rest Required:</span>
                  <span className={tripBreakdown.requiresImmediateRest ? 'warning' : ''}>
                    {tripBreakdown.requiresImmediateRest ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="result-item">
                  <span>Max Driving per Day:</span>
                  <span>11 hours</span>
                </div>
                <div className="result-item">
                  <span>Required Rest Breaks:</span>
                  <span>{tripBreakdown.requiredRestStops.length}</span>
                </div>
              </div>
            </div>

            {tripBreakdown.requiredRestStops.length > 0 && (
              <div className="result-section" style={{ marginTop: '2rem' }}>
                <h3>Required Rest Stops</h3>
                {tripBreakdown.requiredRestStops.map((stop, index) => (
                  <div key={index} className="result-item">
                    <span>{stop.reason}:</span>
                    <span>{stop.startTime} - {stop.endTime}</span>
                  </div>
                ))}
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <strong>Important:</strong> These rest periods are mandatory under DOT regulations. 
                  Plan your route to include safe parking locations for these breaks.
                </div>
              </div>
            )}

            {tripBreakdown.canMakeOnTime && tripBreakdown.hosViolations.length === 0 && (
              <div className="success-message">
                Delivery can be completed on time while maintaining DOT compliance!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
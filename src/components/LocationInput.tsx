import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import { geocodeAddress } from '../utils/geocoding';

interface LocationInputProps {
  label: string;
  value: Location;
  onChange: (location: Location) => void;
  allowDeviceLocation?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  allowDeviceLocation = false
}) => {
  const [address, setAddress] = useState(value.address || '');
  const [useDevice, setUseDevice] = useState(value.useDeviceLocation || false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (useDevice && allowDeviceLocation) {
      getDeviceLocation();
    }
  }, [useDevice, allowDeviceLocation]);

  const getDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...value,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          useDeviceLocation: true
        });
        setLocationError('');
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
        setUseDevice(false);
      }
    );
  };

  const handleAddressChange = async (newAddress: string) => {
    setAddress(newAddress);
    onChange({ ...value, address: newAddress, useDeviceLocation: false });
    
    if (newAddress.length > 5) {
      const result = await geocodeAddress(newAddress);
      if (result) {
        onChange({
          address: newAddress,
          lat: result.lat,
          lng: result.lng,
          useDeviceLocation: false
        });
      }
    }
  };

  return (
    <div className="location-input">
      <label>{label}</label>
      {allowDeviceLocation && (
        <div className="location-toggle">
          <label>
            <input
              type="checkbox"
              checked={useDevice}
              onChange={(e) => setUseDevice(e.target.checked)}
            />
            Use device location
          </label>
        </div>
      )}
      {!useDevice && (
        <input
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Enter address"
          className="address-input"
        />
      )}
      {locationError && <div className="error">{locationError}</div>}
      {value.lat && value.lng && (
        <div className="coords">
          Coordinates: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};
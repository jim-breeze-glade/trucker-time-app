import React from 'react';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 4) {
      onChange(input);
    }
  };

  const formatDisplay = (time: string): string => {
    if (time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return time;
  };

  const isValidTime = (time: string): boolean => {
    if (time.length !== 4) return false;
    const hours = parseInt(time.substring(0, 2));
    const minutes = parseInt(time.substring(2, 4));
    return hours <= 23 && minutes <= 59;
  };

  return (
    <div className="time-input">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="HHMM (e.g., 1430 for 2:30 PM)"
        maxLength={4}
        className={error || (value.length === 4 && !isValidTime(value)) ? 'error' : ''}
      />
      {value.length === 4 && (
        <div className="time-display">
          {isValidTime(value) ? formatDisplay(value) : 'Invalid time'}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};
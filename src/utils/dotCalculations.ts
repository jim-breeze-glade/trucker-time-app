import { LoadDetails, RouteEstimate } from '../types';
import { calculateDistance } from './geocoding';

const AVERAGE_SPEED_MPH = 50;
const MAX_DRIVING_HOURS = 11;
const MAX_ON_DUTY_HOURS = 14;
const REQUIRED_BREAK_HOURS = 10;
const THIRTY_MINUTE_BREAK_AFTER = 8;

export const parseTime = (timeStr: string): Date | null => {
  if (!timeStr || timeStr.length !== 4) return null;
  
  const hours = parseInt(timeStr.substring(0, 2));
  const minutes = parseInt(timeStr.substring(2, 4));
  
  if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}`;
};

export const calculateRoute = (loadDetails: LoadDetails): RouteEstimate | null => {
  const violations: string[] = [];
  
  if (!loadDetails.currentLocation.lat || !loadDetails.currentLocation.lng ||
      !loadDetails.pickupLocation.lat || !loadDetails.pickupLocation.lng ||
      !loadDetails.deliveryLocation.lat || !loadDetails.deliveryLocation.lng) {
    return null;
  }
  
  const currentTime = parseTime(loadDetails.currentTime);
  const pickupTime = parseTime(loadDetails.pickupTime);
  const deliveryTime = parseTime(loadDetails.deliveryTime);
  
  if (!currentTime || !pickupTime || !deliveryTime) {
    return null;
  }
  
  const pickupDistance = calculateDistance(
    loadDetails.currentLocation.lat,
    loadDetails.currentLocation.lng,
    loadDetails.pickupLocation.lat,
    loadDetails.pickupLocation.lng
  );
  
  const deliveryDistance = calculateDistance(
    loadDetails.pickupLocation.lat,
    loadDetails.pickupLocation.lng,
    loadDetails.deliveryLocation.lat,
    loadDetails.deliveryLocation.lng
  );
  
  const pickupDrivingTime = pickupDistance / AVERAGE_SPEED_MPH;
  const deliveryDrivingTime = deliveryDistance / AVERAGE_SPEED_MPH;
  const totalDrivingTime = pickupDrivingTime + deliveryDrivingTime;
  
  const loadingTimeHours = loadDetails.estimatedLoadingTime / 60;
  const totalTime = totalDrivingTime + loadingTimeHours;
  
  const estimatedArrivalTime = new Date(currentTime.getTime());
  estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + (totalTime * 60));
  
  const availableDrivingHours = Math.min(
    loadDetails.dotHoursAvailable,
    MAX_DRIVING_HOURS - loadDetails.dotHoursUsed
  );
  
  const availableOnDutyHours = MAX_ON_DUTY_HOURS - loadDetails.dotHoursUsed;
  
  if (totalDrivingTime > availableDrivingHours) {
    violations.push(`Driving time (${totalDrivingTime.toFixed(1)}h) exceeds available hours (${availableDrivingHours.toFixed(1)}h)`);
  }
  
  if (totalTime > availableOnDutyHours) {
    violations.push(`Total on-duty time (${totalTime.toFixed(1)}h) exceeds 14-hour limit`);
  }
  
  if (loadDetails.dotHoursUsed + totalDrivingTime > THIRTY_MINUTE_BREAK_AFTER && 
      loadDetails.dotHoursUsed < THIRTY_MINUTE_BREAK_AFTER) {
    violations.push('30-minute break required after 8 hours of driving');
  }
  
  const deadlineTime = new Date(deliveryTime.getTime());
  if (deliveryTime < currentTime) {
    deadlineTime.setDate(deadlineTime.getDate() + 1);
  }
  
  if (estimatedArrivalTime > deadlineTime) {
    violations.push(`Cannot meet delivery deadline (arrives ${formatTime(estimatedArrivalTime)}, deadline ${loadDetails.deliveryTime})`);
  }
  
  const hoursRemaining = availableDrivingHours - totalDrivingTime;
  const timeRemaining = (deadlineTime.getTime() - estimatedArrivalTime.getTime()) / (1000 * 60 * 60);
  
  return {
    pickupDistance,
    pickupDrivingTime,
    deliveryDistance,
    deliveryDrivingTime,
    totalDrivingTime,
    totalTime,
    estimatedArrivalTime,
    hoursRemaining,
    timeRemaining,
    isLegal: violations.length === 0,
    violations
  };
};
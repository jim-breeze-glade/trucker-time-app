export interface Location {
  address?: string;
  lat?: number;
  lng?: number;
  useDeviceLocation?: boolean;
}

export interface LoadDetails {
  currentLocation: Location;
  currentTime: string;
  pickupLocation: Location;
  pickupTime: string;
  estimatedLoadingTime: number;
  deliveryLocation: Location;
  deliveryTime: string;
  dotHoursAvailable: number;
  dotHoursUsed: number;
}

export interface RouteEstimate {
  pickupDistance: number;
  pickupDrivingTime: number;
  deliveryDistance: number;
  deliveryDrivingTime: number;
  totalDrivingTime: number;
  totalTime: number;
  estimatedArrivalTime: Date;
  hoursRemaining: number;
  timeRemaining: number;
  isLegal: boolean;
  violations: string[];
}
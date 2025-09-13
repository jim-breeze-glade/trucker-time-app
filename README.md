# Multi-Day Delivery Estimation Tool

A professional React application designed for truckers to estimate multi-day delivery schedules while ensuring DOT (Department of Transportation) hours of service compliance, with full timezone support and current HOS tracking.

## Features

### Timezone-Aware Trip Planning
- **Interactive Date/Time Selection**: Click-friendly calendar inputs for selecting:
  - Current date and time with timezone
  - Pickup date and time with timezone
  - Delivery deadline with timezone
- **Multi-Timezone Support**: Handle trips across different US time zones:
  - Eastern Time (ET)
  - Central Time (CT) 
  - Mountain Time (MT)
  - Arizona Time (MST)
  - Pacific Time (PT)
  - Alaska Time (AKT)
  - Hawaii Time (HST)
- **Real-time Validation**: Ensures logical date progression accounting for timezone differences

### Current HOS Status Tracking
- **Hours Driven Today**: Track current driving hours (0-11)
- **Hours On-Duty Today**: Monitor total on-duty time (0-14)
- **70-Hour/8-Day Cycle**: Track cumulative hours in current cycle
- **Break Compliance**: Monitor time since last 30-minute break
- **Immediate Rest Detection**: Automatically identifies when rest is required

### Trip Calculation
- **Distance-Based Estimation**: Enter total distance in miles
- **Speed Customization**: Set your average MPH (1-80 MPH range)
- **Automatic Time Calculation**: Instantly calculates total driving time needed

### DOT Compliance
The application automatically enforces DOT Hours of Service regulations:
- **11 Hours Maximum Driving**: Per day driving limit
- **14 Hours On-Duty**: Maximum on-duty time per day
- **10 Hours Rest Required**: Mandatory rest break between driving days
- **Multi-Day Trip Planning**: Automatically calculates required rest stops for long hauls

### Results Display
- **Trip Overview**:
  - Total driving time required
  - Number of days needed
  - Delivery feasibility assessment
  - Extra time available (if applicable)
  
- **DOT Compliance Details**:
  - Number of required rest stops
  - Specific timing for each rest period
  - Visual alerts for timeline violations

- **Rest Stop Schedule**:
  - Day-by-day breakdown with timezone awareness
  - Start and end times for each rest period
  - Immediate rest requirements based on current HOS
  - Helpful reminders about safe parking locations

### HOS Violation Detection
- **Real-time Compliance Monitoring**: Instant alerts for HOS violations
- **Visual Warnings**: Clear indicators for compliance issues
- **Detailed Violation Messages**: Specific information about what limits are exceeded
- **Preventive Recommendations**: Guidance on required actions

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jim-breeze-glade/trucker-time-app.git
cd trucker-time-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Step 1: Enter Current HOS Status
- **Hours Driven Today**: Enter how many hours you've already driven today (0-11)
- **Hours On-Duty Today**: Input total on-duty time including non-driving work (0-14)  
- **Current 8-Day Cycle Hours**: Track cumulative hours in your current 70-hour/8-day cycle
- **Hours Since Last Break**: Time elapsed since your last 30-minute break

### Step 2: Set Trip Timeline with Timezones
- **Current Date/Time**: Auto-populated but adjustable with timezone selection
- **Pickup Date/Time**: When you'll pick up the load, with destination timezone
- **Delivery Deadline**: Required delivery time in the delivery location's timezone

### Step 3: Configure Trip Parameters
- **Average Speed**: Your realistic average MPH including stops (1-80 MPH)
- **Total Distance**: Miles from pickup to delivery location

### Step 4: Calculate and Review
Click "Calculate Trip & Check DOT Compliance" to see:
- **HOS Violation Alerts**: Immediate warnings for current violations
- **Timeline Feasibility**: Whether delivery can be made on time
- **Required Rest Stops**: Mandatory breaks with specific timing
- **Available Hours**: Current remaining driving hours today
- **Multi-day Planning**: Complete schedule for long hauls

## Technology Stack

- **React 19**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **CSS3**: Clean, responsive styling
- **HTML5**: Native date/time inputs for better UX

## Key Calculations

### Driving Time
```
Total Driving Time = Distance (miles) / Average Speed (MPH)
```

### Days Required
```
Days Needed = Total Driving Time / 11 hours (max daily driving)
```

### Rest Stops
```
Rest Stops = Days Needed - 1 (10 hours each)
```

### Total Time Needed
```
Total Time = Driving Time + (Rest Stops × 10 hours)
```

## DOT Regulations Reference

The app follows FMCSA Hours of Service rules:
- **11-Hour Driving Limit**: May drive a maximum of 11 hours after 10 consecutive hours off duty
- **14-Hour Limit**: May not drive beyond the 14th consecutive hour after coming on duty
- **Rest Breaks**: Drivers must take a 30-minute break when they have driven for 8 cumulative hours
- **10-Hour Off-Duty**: Must have 10 consecutive hours off duty before starting a new work period

## Tips for Accurate Estimates

1. **Average Speed**: Include time for:
   - Fuel stops
   - Food breaks
   - Traffic conditions
   - Weather delays
   - Typical highway speeds are 55-65 MPH when accounting for stops

2. **Distance**: Use actual route miles, not straight-line distance

3. **Buffer Time**: Always plan for unexpected delays

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run deploy`
Deploys the application to GitHub Pages.

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

The app will be available at: https://jim-breeze-glade.github.io/trucker-time-app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/jim-breeze-glade/trucker-time-app/issues).

## Future Enhancements

- Integration with mapping APIs for automatic distance calculation
- Real-time traffic data integration
- Weather condition adjustments
- Fuel stop planning
- Load weight impact on speed
- Team driving calculations
- Export trip plans to PDF
- Mobile app version
- Integration with ELD (Electronic Logging Device) systems

## Disclaimer

This tool provides estimates based on input parameters. Always verify compliance with current DOT regulations and account for real-world conditions. This tool is for planning purposes only and should not replace professional judgment or official DOT compliance tools.
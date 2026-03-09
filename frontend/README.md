# IoT Admin Dashboard - React Application

A modern React-based IoT Admin Dashboard with AWS DynamoDB integration and automatic fallback to demo mode.

## Features

- **Device Management**: View, filter, and search IoT devices
- **Real-time Statistics**: Monitor device status (Online, Offline, Fault)
- **Customer Management**: Track customers and their subscriptions
- **Engineer Management**: Assign and manage technical staff
- **Fault Tracking**: Monitor and resolve device issues
- **Subscription Management**: Handle service plans and billing
- **Responsive Design**: Works on desktop and mobile devices
- **AWS Integration**: Connects to DynamoDB with automatic demo fallback

## Quick Start

### Option 1: Use Startup Script
```bash
start-app.bat
```

### Option 2: Manual Setup
```bash
npm install
npm start
```

## Configuration

### AWS DynamoDB (Production)
1. Copy `.env` to `.env.local`
2. Add your AWS credentials to `.env.local`
3. Ensure DynamoDB table `seniotusers` exists

### Demo Mode (Development)
Runs automatically if AWS credentials are not configured or connection fails.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   ├── cards/          # Dashboard cards
│   ├── charts/         # Data visualization
│   ├── layout/         # Layout components
│   ├── modals/         # Modal dialogs
│   └── tables/         # Data tables
├── config/             # Configuration files
├── data/               # Static/fallback data
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── routes/             # Route definitions
├── services/           # Data services
└── utils/              # Utility functions
```

## Available Routes

- `/` - Dashboard
- `/customers` - Customer Management
- `/customers/:id` - Customer Details
- `/devices` - Device Management
- `/devices/:id` - Device Details
- `/engineers` - Engineer Management
- `/engineers/:id` - Engineer Details
- `/faults` - Fault Management
- `/faults/:id` - Fault Details
- `/subscriptions` - Subscription Management

## Technologies Used

- React 18
- React Router DOM v6
- AWS SDK v3 (DynamoDB)
- Recharts for data visualization
- CSS3 with modern gradients and animations

## Troubleshooting

See `SETUP_TROUBLESHOOTING.md` for detailed troubleshooting guide.

## Build for Production

```bash
npm run build
```

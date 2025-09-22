# Call Assistant - Teams Meeting Bot

A React-based web application that allows an AI bot to join Microsoft Teams meetings, capture live captions, monitor participants, and automatically manage call lifecycle.

## Features

- 🤖 **Automated Meeting Join**: Bot can join Microsoft Teams meetings using meeting links
- 📝 **Live Captions**: Real-time speech-to-text captions during meetings
- 👥 **Participant Monitoring**: Track when participants join/leave meetings
- 🔴 **Recording Detection**: Monitor recording status and auto-enable captions
- 🚪 **Smart Auto-Disconnect**: Automatically leave when all participants have left
- 👨‍💼 **Organizer Tracking**: Detect and monitor meeting organizer presence
- 📱 **Progressive Web App (PWA)**: Installable as a desktop/mobile app
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Azure Communication Services** resource
- **Microsoft Entra ID (Azure AD)** app registration
- **Teams meeting permissions** for the bot

## Project Structure

```
WebApp/
├── src/
│   ├── components/
│   │   ├── CallingApp.jsx      # Main calling interface
│   │   ├── LoginPage.jsx       # Authentication page
│   │   ├── AudioRecorder.jsx   # Audio recording component
│   │   └── ...
│   ├── utils/
│   │   ├── loginUtil.jsx       # Authentication utilities
│   │   └── envUtil.jsx         # Environment variables
│   ├── App.jsx                 # Main app component
│   └── main.jsx               # App entry point
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md               # This file
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd CallAssistant/WebAPI/WebApp

# Install dependencies
npm install
```

### 2. Azure Configuration

#### Azure Communication Services (ACS)
1. Create an Azure Communication Services resource in Azure Portal
2. Get your **Connection String** from the resource's "Keys" section
3. Note the **Endpoint URL** and **Access Key**

#### Microsoft Entra ID App Registration
1. Go to Azure Portal → Microsoft Entra ID → App registrations
2. Create a new registration with:
   - **Name**: Call Assistant Bot
   - **Redirect URI**: `http://localhost:5173` (for development)
3. Note the **Application (client) ID** and **Directory (tenant) ID**
4. Under "API permissions", add:
   - `https://auth.msft.communication.azure.com/Teams.ManageCalls`
   - `https://auth.msft.communication.azure.com/Teams.ManageChats`

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Microsoft Entra ID (Azure AD) Configuration
VITE_CLIENT_ID=your-azure-ad-client-id
VITE_TENANT_ID=your-azure-ad-tenant-id

# Azure Communication Services Configuration
VITE_ACS_CONNECTION_EP=https://your-acs-resource.communication.azure.com
VITE_ACS_CONNECTION_KEY=your-acs-access-key

# API Configuration (if using backend)
VITE_API_BASE_URL=http://localhost:5000
```

**⚠️ Important**: 
- Replace all placeholder values with your actual Azure resource details
- Never commit the `.env.local` file to version control
- Add `.env.local` to your `.gitignore` file

### 4. Development Setup

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run preview      # Preview production build locally

# Production
npm run build        # Build for production
npm run lint         # Run ESLint for code quality

# Deployment
npm run build && npm run preview  # Build and preview production
```

## Usage Guide

### Starting a Meeting Session

1. **Open the Application**: Navigate to `http://localhost:5173`
2. **Enter Meeting Details**:
   - Paste the Microsoft Teams meeting link
   - Set a display name for the bot
3. **Connect**: Click "Connect" to join the meeting
4. **Enable Features**:
   - Live captions will auto-start if recording is active
   - Monitor participants in the notifications panel

### Key Features

#### Live Captions
- Automatically enabled when meeting recording starts
- Real-time speech-to-text with speaker identification
- Scrollable caption history

#### Participant Monitoring
- Real-time notifications for joins/leaves
- Organizer detection and tracking
- Auto-disconnect when alone in meeting

#### Smart Controls
- **Connect/Disconnect**: Manual meeting control
- **Auto-disconnect**: Leaves when all participants exit
- **Caption Management**: Automatic or manual caption control

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLIENT_ID` | Azure AD Application ID | ✅ |
| `VITE_TENANT_ID` | Azure AD Tenant ID | ✅ |
| `VITE_ACS_CONNECTION_EP` | ACS Endpoint URL | ✅ |
| `VITE_ACS_CONNECTION_KEY` | ACS Access Key | ✅ |
| `VITE_API_BASE_URL` | Backend API URL (optional) | ❌ |

### Vite Configuration

The project uses Vite with:
- **React** with Fast Refresh
- **Tailwind CSS** for styling
- **PWA** capabilities
- **ESLint** for code quality

## Building for Production

```bash
# Build the application
npm run build

# Output will be in the 'dist' folder
# Deploy the contents of 'dist' to your web server
```

### Production Environment Variables

For production deployment, set environment variables in your hosting platform:

- **Vercel**: Add to Project Settings → Environment Variables
- **Netlify**: Add to Site Settings → Build & Deploy → Environment Variables  
- **Azure Static Web Apps**: Add to Configuration → Application Settings

## Troubleshooting

### Common Issues

#### "Recording Stopped" notification on refresh
- **Cause**: Component initialization issue
- **Solution**: Already fixed with `recordingStartedRef` tracking

#### Authentication failures
- **Check**: Azure AD app registration redirect URIs
- **Verify**: Client ID and Tenant ID are correct
- **Ensure**: Required API permissions are granted

#### Cannot join meetings
- **Verify**: ACS connection string is correct
- **Check**: Meeting link format is valid
- **Ensure**: Bot has necessary Teams permissions

#### Build failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

### Development Tips

1. **Console Logging**: Check browser console for detailed error messages
2. **Network Tab**: Monitor API calls and responses
3. **Azure Portal**: Check ACS and Azure AD logs for authentication issues

## Dependencies

### Core Dependencies
- **React 19** - UI framework
- **Azure Communication Services** - Teams integration
- **Azure MSAL** - Authentication
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Development Dependencies
- **ESLint** - Code linting
- **Vite PWA Plugin** - Progressive Web App features

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Azure Communication Services documentation
3. Open an issue in the project repository

## Security Notes

- **Environment Variables**: Never expose ACS keys in client-side code in production
- **Authentication**: Use proper Azure AD authentication flows
- **HTTPS**: Always use HTTPS in production environments
- **API Security**: Implement proper backend authentication if using APIs

---

**Happy Coding! 🚀**

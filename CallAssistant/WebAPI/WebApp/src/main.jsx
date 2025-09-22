
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { app, authentication } from '@microsoft/teams-js';
import './index.css';
import App from './App.jsx';
import { checkAuthentication, getAuthenticationData, isChildWindow } from './utils/sessionUtil.js';

// Initialize Teams SDK and check if running in Teams
let isInTeams = false;
let callWindow = null;

// Function to open child window with session data
const openChildWindow = () => {
  if (isInTeams && checkAuthentication()) {
    const authData = getAuthenticationData();
    
    if (authData) {
      // Open child window
      //callWindow = window.open('https://9b935f0dd7ab.ngrok-free.app', 'callClient', 'width=400,height=600');
      
      // Wait for child window to load and send session data
      if (callWindow) {
        const sendSessionData = () => {
          if (callWindow && !callWindow.closed) {
            callWindow.postMessage({
              type: 'SESSION_DATA',
              acs_token: authData.acs_token,
              aad_userInfo: JSON.stringify(authData.aad_userInfo)
            }, '*');
          }
        };
        
        // Send data immediately if window is ready, otherwise wait
        setTimeout(sendSessionData, 1000);
        
        // Store child window reference globally
        window.callWindow = callWindow;
      }
    }
  }
};

// Function to initialize Teams detection
const initializeTeams = async () => {
  // Skip Teams initialization if this is a popup/child window (opened via window.open)
  if (isChildWindow()) {
    console.log('Running in popup/child window, skipping Teams initialization');
    return;
  }

  // Initialize Teams SDK (works in both iframe and direct contexts)
  try {
    await app.initialize();
    const context = await app.getContext();
    if (context?.app?.host?.name.includes('Teams')) {
      isInTeams = true;
      const token = await authentication.getAuthToken();
      console.log('App is running inside Microsoft Teams');
      
      // Check if already authenticated and open child window
      if (checkAuthentication()) {
        console.log('User is authenticated, opening child window...');
        openChildWindow();
      } else {
        console.log('User not authenticated yet');
      }
    } else {
      console.log('App is NOT running inside Microsoft Teams');
    }
  } catch (error) {
    console.log('Not running in Teams environment:', error.message);
  }
  
  // Store Teams status globally for use in components
  window.isInTeams = isInTeams;
  window.openChildWindow = openChildWindow;
  window.checkAuthentication = checkAuthentication;
};

// Initialize Teams detection
initializeTeams();

// Listen for authentication events from localStorage/sessionStorage changes
window.addEventListener('storage', (event) => {
  if ((event.key === 'acs_token' || event.key === 'aad_userInfo') && event.newValue) {
    console.log('Authentication detected, checking if should open child window...');
    if (isInTeams && checkAuthentication() && !callWindow) {
      setTimeout(openChildWindow, 500); // Small delay to ensure both tokens are set
    }
  }
});

// Also listen for custom authentication events
window.addEventListener('user-authenticated', () => {
  console.log('Custom authentication event received');
  if (isInTeams && checkAuthentication() && !callWindow) {
    openChildWindow();
  }
});

// Disable refresh on tab (F5, Ctrl+R, Ctrl+F5)
window.addEventListener('keydown', (event) => {
  // Disable F5
  if (event.key === 'F5') {
    event.preventDefault();
    console.log('Refresh disabled (F5)');
    return false;
  }
  
  // Disable Ctrl+R and Ctrl+F5
  if ((event.ctrlKey && event.key === 'r') || (event.ctrlKey && event.key === 'F5')) {
    event.preventDefault();
    console.log('Refresh disabled (Ctrl+R/Ctrl+F5)');
    return false;
  }
});

// Prevent context menu refresh option (right-click -> reload)
window.addEventListener('contextmenu', () => {
  if (isInTeams) {
    // event.preventDefault(); // Commented out for now
  }
});

// Function to handle messages from child window
const handleChildWindowMessage = (event) => {
  if (event.data && event.data.type === 'REQUEST_SESSION_DATA') {
    // Child window is requesting session data
    const authData = getAuthenticationData();
    
    if (authData && event.source) {
      event.source.postMessage({
        type: 'SESSION_DATA',
        acs_token: authData.acs_token,
        aad_userInfo: JSON.stringify(authData.aad_userInfo)
      }, '*');
    }
  }
};

// Handle beforeunload to prevent child window issues
window.addEventListener('beforeunload', () => {
  // If we're the parent window and have a child window open
  if (!isChildWindow() && callWindow && !callWindow.closed) {
    // Notify child window that parent is refreshing
    try {
      callWindow.postMessage({
        type: 'PARENT_REFRESHING'
      }, '*');
    } catch (err) {
      console.log('Could not notify child window of parent refresh:', err.message);
    }
  }
});

// Listen for messages from child windows
window.addEventListener('message', handleChildWindowMessage);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

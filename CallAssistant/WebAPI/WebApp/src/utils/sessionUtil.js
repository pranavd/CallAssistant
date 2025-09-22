// Utility functions for session storage and window communication

// Function to get session data from parent window (for child windows)
export const getSessionDataFromParent = () => {
  return new Promise((resolve, reject) => {
    // If we're in the parent window or iframe, get data directly
    if (!isChildWindow()) {
      const acsToken = sessionStorage.getItem('acs_token');
      const aadUserInfo = sessionStorage.getItem('aad_userInfo');
      
      if (acsToken && aadUserInfo) {
        resolve({
          acs_token: acsToken,
          aad_userInfo: JSON.parse(aadUserInfo)
        });
      } else {
        reject(new Error('Session data not found'));
      }
      return;
    }

    // Check if data already exists in child window's session storage
    const existingToken = sessionStorage.getItem('acs_token');
    const existingUserInfo = sessionStorage.getItem('aad_userInfo');
    
    if (existingToken && existingUserInfo) {
      console.log('Using existing session data in child window');
      resolve({
        acs_token: existingToken,
        aad_userInfo: JSON.parse(existingUserInfo)
      });
      return;
    }

    // If we're in a popup window, request data from the opener window
    const messageHandler = (event) => {
      if (event.data && event.data.type === 'SESSION_DATA') {
        window.removeEventListener('message', messageHandler);
        
        // Store the received data in the child window's session storage
        if (event.data.acs_token) {
          sessionStorage.setItem('acs_token', event.data.acs_token);
        }
        if (event.data.aad_userInfo) {
          sessionStorage.setItem('aad_userInfo', event.data.aad_userInfo);
        }
        
        resolve({
          acs_token: event.data.acs_token,
          aad_userInfo: typeof event.data.aad_userInfo === 'string' 
            ? JSON.parse(event.data.aad_userInfo) 
            : event.data.aad_userInfo
        });
      } else if (event.data && event.data.type === 'PARENT_REFRESHING') {
        console.log('Parent window is refreshing, maintaining child window state');
        // Don't refresh the child window, just continue with existing session data
        window.removeEventListener('message', messageHandler);
        
        if (existingToken && existingUserInfo) {
          resolve({
            acs_token: existingToken,
            aad_userInfo: JSON.parse(existingUserInfo)
          });
        } else {
          reject(new Error('Parent refreshing and no local session data available'));
        }
      }
    };

    // Listen for response from opener window
    window.addEventListener('message', messageHandler);

    // Request session data from opener window (not parent, since we're a popup)
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'REQUEST_SESSION_DATA'
        }, '*');
      } catch (err) {
        console.log('Could not communicate with opener window:', err.message, 'using local data if available');
        window.removeEventListener('message', messageHandler);
        
        if (existingToken && existingUserInfo) {
          resolve({
            acs_token: existingToken,
            aad_userInfo: JSON.parse(existingUserInfo)
          });
        } else {
          reject(new Error('No opener window available and no local session data'));
        }
      }
    } else {
      console.log('No opener window available');
      window.removeEventListener('message', messageHandler);
      
      if (existingToken && existingUserInfo) {
        resolve({
          acs_token: existingToken,
          aad_userInfo: JSON.parse(existingUserInfo)
        });
      } else {
        reject(new Error('No opener window available and no local session data'));
      }
    }

    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      
      // If timeout occurs, try to use existing session data
      if (existingToken && existingUserInfo) {
        console.log('Timeout waiting for parent, using existing session data');
        resolve({
          acs_token: existingToken,
          aad_userInfo: JSON.parse(existingUserInfo)
        });
      } else {
        reject(new Error('Timeout waiting for session data from opener window'));
      }
    }, 5000);
  });
};

// Function to check if current window is a child window (popup)
export const isChildWindow = () => {
  // Check if this is a popup window (has an opener and different origin from parent)
  return window.opener && window.opener !== window;
};

// Function to check if we're running in an iframe (Teams context)
export const isInIframe = () => {
  return window !== window.top;
};

// Function to check if we're in a Teams iframe specifically
export const isTeamsIframe = () => {
  return isInIframe() && !isChildWindow();
};

// Function to check if user is authenticated (works in both parent and child)
export const checkAuthentication = () => {
  const acsToken = sessionStorage.getItem('acs_token');
  const aadUserInfo = sessionStorage.getItem('aad_userInfo');
  return !!(acsToken && aadUserInfo);
};

// Function to get authentication data from session storage
export const getAuthenticationData = () => {
  const acsToken = sessionStorage.getItem('acs_token');
  const aadUserInfo = sessionStorage.getItem('aad_userInfo');
  
  if (acsToken && aadUserInfo) {
    return {
      acs_token: acsToken,
      aad_userInfo: JSON.parse(aadUserInfo)
    };
  }
  
  return null;
};

// Function to set authentication data in session storage
export const setAuthenticationData = (acsToken, aadUserInfo) => {
  if (acsToken) {
    sessionStorage.setItem('acs_token', acsToken);
  }
  if (aadUserInfo) {
    sessionStorage.setItem('aad_userInfo', JSON.stringify(aadUserInfo));
  }
  
  // Dispatch custom event to notify other parts of the app
  const authEvent = new CustomEvent('user-authenticated', {
    detail: { acsToken, aadUserInfo }
  });
  window.dispatchEvent(authEvent);
};

// Function to clear authentication data
export const clearAuthenticationData = () => {
  sessionStorage.removeItem('acs_token');
  sessionStorage.removeItem('aad_userInfo');
  
  // Dispatch custom event to notify other parts of the app
  const authEvent = new CustomEvent('user-logout');
  window.dispatchEvent(authEvent);
};
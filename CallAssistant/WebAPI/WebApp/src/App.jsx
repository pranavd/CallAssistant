
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import About from './About';
import CallingApp from './components/CallingApp';
import LoginPage from './components/LoginPage';
import LoginUser from './components/LoginUser';
import { requestAcsTokenForTeams } from './utils/loginUtil';
import { getSessionDataFromParent, isChildWindow, checkAuthentication, getAuthenticationData, setAuthenticationData } from './utils/sessionUtil.js';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isChildWindow()) {
          // We're in a popup window, get session data from parent
          console.log('Popup window detected, requesting session data from parent...');
          const sessionData = await getSessionDataFromParent();
          
          if (sessionData && sessionData.acs_token && sessionData.aad_userInfo) {
            setUserName(sessionData.aad_userInfo.name || sessionData.aad_userInfo);
            setIsLoggedIn(true);
            console.log('Successfully loaded session data in popup window');
          } else {
            console.log('No valid session data received from parent');
          }
        } else {
          // We're in the parent window/iframe, check local session storage
          console.log('Parent window detected, checking local session data...');
          if (checkAuthentication()) {
            const authData = getAuthenticationData();
            if (authData && authData.aad_userInfo) {
              setUserName(authData.aad_userInfo.name || authData.aad_userInfo);
              setIsLoggedIn(true);
              console.log('Successfully loaded session data from local storage');
            }
          } else {
            console.log('No authentication data found in session storage');
          }
        }
      } catch (err) {
        console.error('Failed to initialize authentication:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const tokenResponse = await requestAcsTokenForTeams();
      if (tokenResponse) {
        // Store the authentication data using the utility function
        setAuthenticationData(tokenResponse.token, tokenResponse.aadUserInfo);
        
        setUserName(tokenResponse.aadUserInfo.name || tokenResponse.aadUserInfo);
        setIsLoggedIn(true);
        
        console.log('Login successful, authentication data stored');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isChildWindow() ? 'Loading session data from parent window...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app content
  return (
    <>
      {/* Show different navigation based on window type */}
      {isChildWindow() ? (
        // Simplified header for popup windows but with LoginUser component
        <nav className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex gap-4">
            <span className="text-sm text-blue-100">Call Window</span>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-xl font-bold tracking-wide">On-Call Bot</span>
            <span className="text-base text-blue-100 mt-1">Join your MS Teams meeting, view live captions, and receive notifications</span>
          </div>
          <LoginUser userName={userName} />
        </nav>
      ) : (
        // Full navigation for parent windows
        <nav className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex gap-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-xl font-bold tracking-wide">On-Call Bot</span>
            <span className="text-base text-blue-100 mt-1">Join your MS Teams meeting, view live captions, and receive notifications</span>
          </div>
          <LoginUser userName={userName} />
        </nav>
      )}

      {/* Routes - different routes based on window type */}
      {isChildWindow() ? (
        // Popup window shows only the calling app
        <CallingApp />
      ) : (
        // Parent window shows full routing
        <Routes>
          <Route path="/" element={<CallingApp />} />
          <Route path="/about" element={<About />} />
        </Routes>
      )}
    </>
  );
}

export default App;
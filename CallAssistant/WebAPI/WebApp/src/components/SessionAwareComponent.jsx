import React, { useEffect, useState } from 'react';
import { getSessionDataFromParent, isChildWindow, checkAuthentication, getAuthenticationData } from '../utils/sessionUtil.js';

const SessionAwareComponent = () => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        if (isChildWindow()) {
          // We're in a child window, get data from parent
          console.log('Child window detected, requesting session data from parent...');
          const data = await getSessionDataFromParent();
          setSessionData(data);
        } else {
          // We're in the parent window, get data directly
          console.log('Parent window detected, getting session data directly...');
          if (checkAuthentication()) {
            const data = getAuthenticationData();
            setSessionData(data);
          } else {
            throw new Error('Not authenticated');
          }
        }
      } catch (err) {
        console.error('Failed to load session data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, []);

  if (loading) {
    return <div>Loading session data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!sessionData) {
    return <div>No session data available</div>;
  }

  return (
    <div>
      <h3>Session Data</h3>
      <div>
        <strong>Window Type:</strong> {isChildWindow() ? 'Child Window' : 'Parent Window'}
      </div>
      <div>
        <strong>ACS Token:</strong> {sessionData.acs_token ? 'Available' : 'Not available'}
      </div>
      <div>
        <strong>User Info:</strong> {sessionData.aad_userInfo ? JSON.stringify(sessionData.aad_userInfo, null, 2) : 'Not available'}
      </div>
    </div>
  );
};

export default SessionAwareComponent;
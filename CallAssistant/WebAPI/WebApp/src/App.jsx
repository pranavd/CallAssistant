
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import About from './About';
import CallingApp from './components/CallingApp';
import LoginButton from './components/LoginButton';
import LoginPage from './components/LoginPage';
import LoginUser from './components/LoginUser';
import { requestAcsTokenForTeams } from './utils/loginUtil';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const cachedToken = sessionStorage.getItem('acs_token');
    if (cachedToken) {
      const aadUserInfo = sessionStorage.getItem('aad_userInfo');
      if (aadUserInfo) {
        setUserName(aadUserInfo);
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = async () => {
    const tokenResponse = await requestAcsTokenForTeams();
    if (tokenResponse) {
      setUserName(tokenResponse.aadUserInfo);
      setIsLoggedIn(true);
    }
  };

  // if (!isLoggedIn) {
  //   return <LoginPage onLogin={handleLogin} />;
  // }

  return (
    <>
      <nav className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-xl font-bold tracking-wide">On-Call Bot</span>
          <span className="text-base text-blue-100 mt-1">Join your MS Teams meeting, view live captions, and receive notifications</span>
        </div>
        {/* <LoginUser  userName={userName} /> */}
      </nav>

      <Routes>
        <Route path="/" element={<CallingApp />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
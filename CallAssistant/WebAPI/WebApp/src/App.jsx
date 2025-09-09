import { useState, useEffect } from 'react'
import { app } from '@microsoft/teams-js'
import Layout from './components/Layout'
import CallingApp from './components/CallingApp'
import TestComponent from './components/TestComponent'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // This is the core initialization call
    app.initialize().then(() => {
      console.log("TeamsJS SDK initialized successfully.");

      // After initialization, get the user context
      app.getContext().then((context) => {
        // The user object contains details like their display name
        console.log('context details', context);
        if (context.user) {
          setUserName(JSON.stringify(context));
        }
      }).catch((err) => {
        console.error("Error getting context:", err);
        setError("Could not get user context.");
      });

    }).catch((err) => {
      console.error("Error initializing TeamsJS SDK:", err);
      setError("Could not initialize the Teams App.");
    });
  }, []);

  return (
    <>
      <div>
        {/* <b>Hello World!!</b>
        <br /><br />
        <b>User Details: {userName}</b>
        <br /><br />
        <b>Error: {error}</b>
        <br /> */}
        {/* <Layout></Layout> */}
        {/* <TestComponent></TestComponent> */}
        <CallingApp></CallingApp>
      </div>
    </>
  )
}

export default App

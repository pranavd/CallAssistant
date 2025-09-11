import React, { useState, useEffect, useRef } from 'react';
import { CallClient, Features } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';


// const API_BASE_URL = window.location.origin;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let call;
let callAgent;
let callCaptions;

const CallingApp = () => {
    const [meetingLink, setMeetingLink] = useState('');
    const [botDisplayName, setBotDisplayName] = useState('');

    const [enabledCaptions, setEnabledCaptions] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isCallConnected, setIsCallConnected] = useState(false);

    const [captions, setCaptions] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Add ref for the captions container
    const captionsContainerRef = useRef(null);

    useEffect(() => {
        if (isRecording) {
            setNotifications([
                ...notifications,
                { id: Math.random(), message: 'Recording Started' }
            ]);
            if (isCallConnected && !enabledCaptions) {
                enableCaptions();
            }
        } else {
            setNotifications([
                ...notifications,
                { id: Math.random(), message: 'Recording Stopped' }
            ]);
        }
    }, [isRecording])

    useEffect(() => {
        if (captionsContainerRef.current && captions.length > 0) {
            captionsContainerRef.current.scrollTop = captionsContainerRef.current.scrollHeight;
        }
    }, [captions]);

    const handleJoin = async () => {
        setNotifications([
            ...notifications,
            { id: Math.random(), message: 'Joining meeting...' }
        ]);

        // Fetch token from backend
        try {
            const cachedTokenInfo = sessionStorage.getItem('acs_token');
            if (!cachedTokenInfo) {
                throw new Error("User not Signed In!");
            }
            const acsToken = JSON.parse(cachedTokenInfo).token;
            
            await joinTeamsMeeting(JSON.stringify(acsToken));
        } catch (error) {
            setNotifications([
                ...notifications,
                { id: Math.random(), message: `Joining meeting failed: ${JSON.stringify(error)}` }
            ]);
        }
    };

    const joinTeamsMeeting = async (token) => {
        const callClient = new CallClient();
        const tokenCredential = new AzureCommunicationTokenCredential(token);
        callAgent = await callClient.createCallAgent(tokenCredential);
        call = callAgent.join({ meetingLink: meetingLink }, {});

        setNotifications([
            ...notifications,
            { id: Math.random(), message: 'Joined meeting successfully.' }
        ]);

        callCaptions = call.feature(Features.Captions).captions

        callCaptions.on('CaptionsActiveChanged', () => {
            captionsActiveHandler();
        });

        callCaptions.on('CaptionsReceived', (captionData) => {
            captionsReceivedHandler(captionData);
        });

        call.on('stateChanged', () => {
            onCallStateChanged()
        });

        call.feature(Features.Recording).on('isRecordingActiveChanged', () => {
            onCallRecordingChanged();
        });
    }

    const enableCaptions = async () => {
        try {
            if (isCallConnected) {
                setNotifications([
                    ...notifications,
                    { id: Math.random(), message: 'Starting captions' }
                ]);

                try {
                    await callCaptions.startCaptions({ spokenLanguage: 'en-us' });
                    setNotifications([
                        ...notifications,
                        { id: Math.random(), message: 'Captions Started' }
                    ]);
                    setEnabledCaptions(true);
                } catch (error) {
                    setNotifications([
                        ...notifications,
                        { id: Math.random(), message: `Captions Failed: ${JSON.stringify(error)}` }
                    ]);
                }
            } else {
                setNotifications([
                    ...notifications,
                    { id: Math.random(), message: 'Captions cannot be started, Call should be Connected and Recording should be Started' }
                ]);
            }
        } catch (error) {
            setNotifications([
                ...notifications,
                { id: Math.random(), message: 'Starting captions failed' }
            ]);
            console.log(error)
        }
    }

    const handleHangUp = () => {
        if (call) {
            call.hangUp();
            setNotifications(prev => [
                ...prev,
                { id: Math.random(), message: 'Left the meeting' }
            ]);
        }
    };

    const captionsReceivedHandler = (captionData) => {
        if (captionData.resultType === "Final") {
            setCaptions(prev => [
                ...prev,
                {
                    id: captionData.timestamp,
                    message: captionData.captionText,
                    speaker: captionData.speaker.displayName,
                    timeStamp: captionData.timestamp
                }
            ]);
        }
    }

    const captionsActiveHandler = () => {
        console.log('call captions active: ', callCaptions);
        if (callCaptions.isCaptionsFeatureActive) {
            setNotifications([
                ...notifications,
                { id: Math.random(), message: `Captions Feature: ${callCaptions.isCaptionsFeatureActive}` }
            ]);
        }
    }

    const onCallStateChanged = () => {
        if (call) {
            setNotifications([
                ...notifications,
                { id: Math.random(), message: call.state }
            ]);

            if (call.state === "Connected") {
                setIsCallConnected(true);
            }
        }
    }

    const onCallRecordingChanged = (event) => {
        if (call) {
            if (call.state === "Connected") {
                if (call.feature(Features.Recording).isRecordingActive) {

                    setIsRecording(true);
                } else {
                    setIsRecording(false);
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 gap-8 mb-8">
                {/* Left Column */}
                <div className="flex flex-col w-full max-w-xs">
                    {/* Meeting Link & Buttons */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <label className="block text-lg font-semibold mb-2 text-center">
                            Paste MS Teams Meeting Link
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://teams.microsoft.com/..."
                            value={meetingLink}
                            onChange={e => setMeetingLink(e.target.value)}
                        />
                        <label className="block text-lg font-semibold mb-2 text-center">
                            Enter Bot Display Name
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Bot Name..."
                            value={botDisplayName}
                            onChange={e => setBotDisplayName(e.target.value)}
                        />
                        <div className="flex justify-center gap-2 mb-2">
                            <button
                                className="min-w-[120px] max-w-[160px] bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition"
                                onClick={handleJoin}
                                disabled={!meetingLink}
                            >
                                Join
                            </button>
                            <button
                                className="min-w-[120px] max-w-[160px] bg-red-700 text-white font-bold py-2 rounded hover:bg-red-700 transition"
                                onClick={handleHangUp}
                                disabled={!call}
                            >
                                Hang Up
                            </button>
                        </div>
                        <button
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition mt-2"
                            onClick={enableCaptions}
                            disabled={!isCallConnected && !isRecording}
                        >
                            Start Live Captions
                        </button>
                    </div>
                    {/* Notifications */}
                    <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
                        <h2 className="text-lg font-semibold mb-3">Meeting Notifications</h2>
                        <div className="overflow-y-auto flex-1 max-h-56">
                            <ul className="space-y-2">
                                {notifications.length === 0 ? (
                                    <li className="text-gray-400">No notifications yet.</li>
                                ) : (
                                    notifications.map(n => (
                                        <li key={n.id} className="text-gray-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                                            {n.message}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
                        <h2 className="text-lg font-semibold mb-3">Meeting Captions</h2>
                        <div className="overflow-y-auto flex-1 max-h-[25rem]">
                            <ul className="space-y-2 ">
                                {captions.length === 0 ? (
                                    <li className="text-gray-400">No captions yet.</li>
                                ) : (
                                    captions.map(n => (
                                        <div key={Math.random()} className="text-gray-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                                            <div>
                                                <span className="text-xs text-gray-500">{new Date(n.timeStamp).toLocaleString()}</span>
                                            </div>
                                            <li>
                                                <b>{n.speaker}</b><span>: </span>
                                                {n.message}
                                            </li>
                                        </div>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <footer className="w-full py-4 bg-gray-200 text-center text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} On-Call Bot. All rights reserved.
            </footer>
        </div>
    );
};

export default CallingApp;
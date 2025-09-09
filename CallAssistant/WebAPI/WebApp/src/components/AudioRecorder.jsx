import React, { useState, useRef, useEffect } from 'react';
import lamejs from 'lamejs';

// This component encapsulates the entire audio recording and MP3 encoding logic.
const AudioRecorder = () => {
    // State to manage the UI and recording status
    const [isRecording, setIsRecording] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Click "Start Recording" to begin.');
    const [audioURL, setAudioURL] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [base64String, setBase64String] = useState('');

    // Refs to hold media objects that don't need to trigger re-renders
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const micStreamRef = useRef(null);
    const displayStreamRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // Effect for cleanup on component unmount
    useEffect(() => {
        // This function will be called when the component is unmounted
        // startRecording1();
        return () => {
            stopAllStreams();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    /**
     * Stops all active media stream tracks.
     */
    const stopAllStreams = () => {
        micStreamRef.current?.getTracks().forEach(track => track.stop());
        displayStreamRef.current?.getTracks().forEach(track => track.stop());
    };

    const startRecording1 = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('devices', devices);

            const diDevice = devices.filter(device => device.deviceId === 'default' && device.kind === 'audioinput');
            const doDevice = devices.filter(device => device.deviceId === 'default' && device.kind === 'audiooutput');

            console.log('diDevice', diDevice);
            console.log('doDevice', doDevice);

            const stream1 = await navigator.mediaDevices.getUserMedia({
                audio: { groupId: 'a6ed9fd45a6f27d27a4897b70bfb892ef50105641869d8d559abf7009bc263b8' }
            });

             const stream2 = await navigator.mediaDevices.getUserMedia({
                audio: { groupId: '566f87b7aafaa4934b8334bc01c10c34193f398fec53617e487a3173e621efbd' }
            });

            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();
            
            const source1 = audioContext.createMediaStreamSource(stream1);
            source1.connect(destination);
            
            const source2 = audioContext.createMediaStreamSource(stream2);
            source2.connect(destination);
            
            const finalStream = destination.stream;

            mediaRecorderRef.current = new MediaRecorder(finalStream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = handleStop;

            mediaRecorderRef.current.start();

            // Update UI state
            setIsRecording(true);
            setStatusMessage('Recording... Click Stop to finish.');
        }
        catch (e) {
            console.log('error while recording', e);
        }
    }

    /**
     * Main function to start the recording process.
     */
    const startRecording = async () => {
        try {
            // Reset previous recordings
            setAudioURL('');
            setDownloadLink('');
            recordedChunksRef.current = [];
            setStatusMessage('Requesting permissions...');

            // 1. Get Microphone and Speaker Audio Streams
            micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            displayStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
                video: true, // Required to get audio
                audio: true
                // audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });

            // 2. Combine streams using the Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const micSource = audioContext.createMediaStreamSource(micStreamRef.current);
            const displaySource = audioContext.createMediaStreamSource(displayStreamRef.current);
            const destination = audioContext.createMediaStreamDestination();

            micSource.connect(destination);
            displaySource.connect(destination);

            const combinedStream = destination.stream;

            // 3. Start MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(combinedStream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = handleStop;

            mediaRecorderRef.current.start();

            // Update UI state
            setIsRecording(true);
            setStatusMessage('Recording... Click Stop to finish.');

        } catch (error) {
            console.error("Error starting recording:", error);
            setStatusMessage(`Error: ${error.message}. Please try again.`);
            stopAllStreams(); // Clean up streams on error
        }
    };

    /**
     * Stops the recording and releases media resources.
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        stopAllStreams(); // Stop mic and display streams
        setIsRecording(false);
        setStatusMessage('Processing audio... please wait.');
    };

    /**
     * Called when recording stops. It processes the recorded data.
     */
    // src/components/AudioRecorder.js

    // ...

    // Replace the existing handleStop function with this async version
    const handleStop = async () => {
        // Create the MP3 Blob as before
        const mp3Blob = new Blob(recordedChunksRef.current, { type: 'audio/mpeg' });

        // Use a FileReader to convert the Blob to a Base64 Data URL
        const reader = new FileReader();
        reader.readAsDataURL(mp3Blob);
        reader.onloadend = () => {
            const base64Data = reader.result;

            // The result includes the full data URL prefix "data:audio/mpeg;base64,"
            // You can use it directly in the audio player
            setAudioURL(base64Data);
            setDownloadLink(base64Data);

            // You can also store it in state
            setBase64String(base64Data);

            // Log the raw Base64 string (without the prefix) to the console
            const rawBase64 = base64Data.split(',')[1];
            console.log("Base64 Encoded MP3:", rawBase64);

            setStatusMessage('Recording finished. Ready to play or download.');
        };

        reader.onerror = (error) => {
            console.error("Failed to read blob:", error);
            setStatusMessage('Error: Failed to process the audio file.');
        };
    };

    // ... the rest of the component

    /**
     * Encodes raw audio data to an MP3 file using the lamejs library.
     * @param {AudioBuffer} audioBuffer The raw audio data to encode.
     */
    const encodeToMp3 = (audioBuffer) => {
        const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128); // Mono, 128kbps
        const pcmData = audioBuffer.getChannelData(0);
        const samples = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            samples[i] = pcmData[i] * 32767.5; // Convert Float32 to Int16
        }

        let mp3Data = [];
        const sampleBlockSize = 1152;

        for (let i = 0; i < samples.length; i += sampleBlockSize) {
            const sampleChunk = samples.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }
        const mp3buf = mp3Encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(mp3Blob);

        // Update UI with the final MP3 file
        setAudioURL(url);
        setDownloadLink(url);
        setStatusMessage('Recording finished. Ready to play or download.');
    };

    return (
        <div style={styles.container}>
            <h1>Combined Audio Recorder</h1>
            <p style={styles.status}>{statusMessage}</p>
            <div style={styles.buttonContainer}>
                <button onClick={startRecording} disabled={isRecording} style={styles.button}>
                    Start Recording
                </button>
                <button onClick={stopRecording} disabled={!isRecording} style={styles.button}>
                    Stop Recording
                </button>
            </div>
            {audioURL && (
                <div style={styles.resultContainer}>
                    <audio src={audioURL} controls style={styles.audioPlayer} />
                    <a href={downloadLink} download="recording.mp3" style={styles.downloadLink}>
                        Download MP3
                    </a>
                </div>
            )}
        </div>
    );
};


// Simple CSS-in-JS for styling the component
const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '40px auto'
    },
    status: {
        color: '#666',
        marginBottom: '1.5rem',
        minHeight: '24px'
    },
    buttonContainer: {
        marginBottom: '1.5rem'
    },
    button: {
        backgroundColor: '#0078d4',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        margin: '5px',
        transition: 'background-color 0.3s'
    },
    resultContainer: {
        width: '100%'
    },
    audioPlayer: {
        width: '100%',
        marginBottom: '1rem'
    },
    downloadLink: {
        display: 'block',
        color: '#0078d4',
        textDecoration: 'none',
        fontWeight: 'bold'
    }
};

export default AudioRecorder;
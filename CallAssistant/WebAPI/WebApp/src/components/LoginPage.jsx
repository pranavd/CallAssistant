import React from 'react';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Welcome to On-Call Bot</h1>
        <p className="text-blue-800 mb-8 text-center">Join your MS Teams meeting, view live captions, and receive notifications.</p>
        <button
          onClick={onLogin}
          className="bg-blue-900 text-white font-semibold px-6 py-3 rounded shadow hover:bg-blue-800 transition border border-blue-900 text-lg"
        >
          Login..To continue
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

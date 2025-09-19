import React from 'react';

const LoginUser = ({ userName }) => {
  return (
    <div className="bg-white text-blue-900 font-semibold px-5 py-2 rounded shadow border border-blue-900 flex items-center">
      <span className="mr-2">👤</span>
      {userName}
    </div>
  );
};

export default LoginUser;

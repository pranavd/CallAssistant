import React from 'react';
import AudioRecorder from './AudioRecorder'

const Layout = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-100 min-h-screen">
            {/* <AudioRecorder></AudioRecorder> */}
            {/* Dropdown Container - Centered */}
            <div className="max-w-lg mb-8 flex justify-center">
                <div className="flex-shrink-0 flex items-center p-2 px-4 w-120 bg-white border border-gray-300 rounded-lg shadow-md">
                    <span className="text-gray-600 mr-2">Next Meeting:</span>
                    <span className="text-gray-600 mr-2"><b>Test Meeting For On-Call Bot</b></span>
                    <button
                        className="bg-blue-600 text-white font-bold py-2 px-4 ml-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Bot
                    </button>
                </div>
            </div>

            {/* Text Boxes Container - Centered */}
            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 max-w-4xl">

                {/* Text Box (B) */}
                <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-md w-full md:w-[400px] h-96 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Meeting Captions</h3>
                    <div className='h-full overflow-y-auto break-words'>
                        <p className="text-gray-500">
                            Place holder for live meeting captions.
                        </p>
                    </div>
                </div>

                {/* Text Box (C) */}
                <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-md w-full md:w-[400px] h-96 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Questions</h3>
                    <div className='h-full overflow-y-auto break-words'>
                        <p className="text-gray-500">
                            Placeholder for suggestions based on meeting captions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
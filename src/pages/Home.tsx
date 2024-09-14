// import React, { useState, useEffect, useContext } from 'react';
// import '../App.css';
// import { Link } from 'react-router-dom';
// import { DataContext } from '../context/dataContext';

// const Home: React.FC = () => {
//   const { setFunTime, setStudyTime, studyTime, funTime,formatTime } = useContext(DataContext)!;

   
//   return (
//     <div className="time-tracker-container">
//       <h1 className="page-title">Time Tracker</h1>
//       <div className="time-box fun-time-box">
//         <h2>Fun Time</h2>
//         <p className="time-display">{formatTime(funTime).hour} Hours  {formatTime(funTime).mins} Minutes  {formatTime(funTime).sec} Seconds</p>
//         {/* <button className="update-button">Update Fun Time</button> */}
//       </div>
//       <div className="time-box study-time-box">
//         <h2>Study Time</h2>
//         <p className="time-display">{formatTime(studyTime).hour} Hours {formatTime(studyTime).mins} minutes {formatTime(studyTime).sec} Seconds</p>
//       </div>
      

//       <Link to="/productivity"><button className="update-button">My Productivity</button></Link>
//     </div>
//   );
// };

// export default Home;

// import React, { useContext } from 'react';
// import { Link,useNavigate } from 'react-router-dom';
// import { DataContext } from '../context/dataContext';

// const Home: React.FC = () => {
//   const { setFunTime, setStudyTime, studyTime, funTime, formatTime,setPopUpOpen } = useContext(DataContext)!;
//   const navigate = useNavigate();
//   function handleBack(){
//     navigate('/');
//   }
//   return (
//     <div className="bg-gray-900  flex flex-col items-center justify-center text-white p-5 gap-4">
//       {/* <h1 className="text-4xl font-bold mb-8">Time Tracker</h1> */}
//       <div className="relative flex justify-between items-center bg-gray-800 p-4 rounded-md shadow-lg w-full">
//         <h1 className="text-white text-2xl font-bold">Time Tracker</h1>
//         <button className='hover:bg-gray-500 p-1 border rounded-sm' onClick={()=>{handleBack()}}>Back</button> </div>

//       <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 w-full max-w-4xl">
//         <div className="bg-red-600 p-6 rounded-lg shadow-lg flex-1">
//           <h2 className="text-2xl font-semibold mb-4">Fun Time</h2>
//           <p className="text-lg mb-4">{formatTime(funTime).hour} Hours {formatTime(funTime).mins} Minutes {formatTime(funTime).sec} Seconds</p>
//           <button 
//             className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setFunTime(funTime + 3600)} // Example of interaction
//           >
//             Add 1 Hour to Fun Time
//           </button>
//         </div>

//         <div className="bg-blue-600 p-6 rounded-lg shadow-lg flex-1">
//           <h2 className="text-2xl font-semibold mb-4">Study Time</h2>
//           <p className="text-lg mb-4">{formatTime(studyTime).hour} Hours {formatTime(studyTime).mins} Minutes {formatTime(studyTime).sec} Seconds</p>
//           <button 
//             className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setStudyTime(studyTime + 3600)} // Example of interaction
//           >
//             Add 1 Hour to Study Time
//           </button>
//         </div>
//       </div>

//       <Link to="/productivity">
//         <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-md  transition duration-300 w-full text-md">
//           My Productivity
//         </button>
//       </Link>
//     </div>
//   );
// };

// export default Home;


import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegClock, FaBook, FaPlayCircle, FaArrowLeft } from 'react-icons/fa';
import { DataContext } from '../context/dataContext';

const Home: React.FC = () => {
  const { setFunTime, setStudyTime, studyTime, funTime, formatTime } = useContext(DataContext)!;
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center text-white p-6 gap-6 min-h-screen">
      <div className="relative flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
          <FaRegClock /> Time Tracker
        </h1>
        <button 
           className='hover:bg-gray-700 p-2 rounded-md'
          onClick={handleBack}
        >
          <FaArrowLeft className="text-white text-2xl" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 w-full max-w-4xl">
        <div className="bg-red-600 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex items-center mb-4">
            <FaPlayCircle className="text-4xl text-white mr-4" />
            <h2 className="text-2xl font-semibold">Fun Time</h2>
          </div>
          <p className="text-lg mb-4">
            {formatTime(funTime).hour} Hours {formatTime(funTime).mins} Minutes {formatTime(funTime).sec} Seconds
          </p>
          <button 
            className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full"
            onClick={() => setFunTime(funTime + 3600)} // Example of interaction
          >
            Add 1 Hour to Fun Time
          </button>
        </div>

        <div className="bg-blue-600 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex items-center mb-4">
            <FaBook className="text-4xl text-white mr-4" />
            <h2 className="text-2xl font-semibold">Study Time</h2>
          </div>
          <p className="text-lg mb-4">
            {formatTime(studyTime).hour} Hours {formatTime(studyTime).mins} Minutes {formatTime(studyTime).sec} Seconds
          </p>
          <button 
            className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full"
            onClick={() => setStudyTime(studyTime + 3600)} // Example of interaction
          >
            Add 1 Hour to Study Time
          </button>
        </div>
      </div>

      <Link to="/productivity" className="w-full max-w-md">
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-md transition duration-300 w-full text-md flex items-center justify-center gap-2">
          <FaBook className="text-xl" />
          My Productivity
        </button>
      </Link>
    </div>
  );
};

export default Home;

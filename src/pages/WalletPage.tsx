// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { DataContext } from '../context/dataContext';
// import { FaBook, FaSmile, FaClock } from 'react-icons/fa';

// const WalletPage: React.FC = () => {
//   const { studyTime, funTime } = useContext(DataContext)!;
//   const limit = 30;
//   const remainingFunTime = limit - funTime;
//   const progressPercentage = (funTime / limit) * 100;

//   return (
//     <div className="wallet-page p-6 bg-gray-900 text-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold mb-4 text-center">Your Content Wallet</h2>

//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center">
//           <FaBook className="text-4xl text-blue-500 mr-4" />
//           <div>
//             <p className="text-lg">Educational Content</p>
//             <p className="text-2xl font-semibold">{studyTime} hrs</p>
//           </div>
//         </div>
//         <div className="flex items-center">
//           <FaSmile className="text-4xl text-yellow-500 mr-4" />
//           <div>
//             <p className="text-lg">Fun Content</p>
//             <p className="text-2xl font-semibold">{funTime} hrs</p>
//           </div>
//         </div>
//       </div>

//       <div className="mb-6">
//         <p className="text-lg mb-2">Fun Time Limit: <span className="font-semibold">{limit} hrs</span></p>
//         <div className="w-full bg-gray-800 rounded-full h-6">
//           <div
//             className="bg-green-500 h-6 rounded-full"
//             style={{ width: `${progressPercentage}%` }}
//           ></div>
//         </div>
//       </div>

//       <div className="flex justify-between items-center">
//         <p className="text-lg">Remaining Fun Time:</p>
//         <p className={`text-2xl font-semibold ${remainingFunTime > 0 ? 'text-green-400' : 'text-red-400'}`}>
//           {remainingFunTime > 0 ? `${remainingFunTime} hrs` : 'Limit Exceeded!'}
//         </p>
//       </div>

//       <div className="mt-6 text-center">
//         <Link
//           to="/custom-values"
//           className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition duration-300 inline-block"
//         >
//           Adjust Limits
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default WalletPage;

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DataContext } from '../context/dataContext';
import { FaCoins, FaClock } from 'react-icons/fa';
import {GiTwoCoins } from 'react-icons/gi';
import {BiCoinStack } from 'react-icons/bi';

const WalletPage: React.FC = () => {
  const { funTime } = useContext(DataContext)!;
  const totalPoints = 100; // Example value
  const usedPoints = 80; // Example value
  const remainingPoints = totalPoints - usedPoints;
  const progressPercentage = (usedPoints / totalPoints) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-5">
      <div className="relative flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Fun Points Wallet</h2>
        
        <div className="flex justify-between items-center w-full mb-6">
          <div className="flex items-center">
            <GiTwoCoins className="text-3xl text-[#fff200] mr-2" /> {/* Muted red color */}
            <div>
              <p className="text-md">Fun Points Used</p>
              <p className="text-xl font-semibold">{usedPoints} pts</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
          <div
            className="bg-[#FF0000] h-3 rounded-full" /* Muted red color */
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <FaClock className="text-3xl text-gray-400 mr-2" />
            <div>
              <p className="text-md">Remaining Points</p>
              <p className="text-xl font-semibold">{remainingPoints} pts</p>
            </div>
          </div>
        </div>

        <Link
          to="/custom-values"
          className="mt-8 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition duration-300 w-full text-center text-bold text-md"
        >
          Adjust Limits
        </Link>
      </div>
    </div>
  );
};

export default WalletPage;

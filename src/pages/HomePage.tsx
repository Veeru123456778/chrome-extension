// import React from 'react';
// import { Link } from 'react-router-dom';

// const HomePage = () => {


//   return (
//     <div className="bg-gray-900  p-4 min-w-[400px]">
//     <div className="relative flex flex-col justify-between items-center bg-gray-800 p-4 rounded-md shadow-lg space-y-5">
//           <h1 className="text-white text-2xl font-bold">YouTube Monitoring</h1>
//           </div>
//           <div className='mt-4'>
//               <div className="flex flex-col w-full gap-4 font-medium">
//                 <Link
//                   to="/home"
//                   className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//                 >
//                   Check Your Stats
//                 </Link>
//                 <Link
//                   to="/custom-values"
//                   className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//                 >
//                   Set Custom Values
//                 </Link>
//               </div>
//              : (
//               <Link to={'/'}
//                 className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//               >
//                 Go Back
//               </Link>
//             )
//         </div>

//     </div>
//   )
// }

// export default HomePage

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';

// const HomePage: React.FC = () => {
//   const [popUpOpen, setPopUpOpen] = useState(false);

//   return (
//     <div className="bg-gray-900 p-4 min-w-[400px]">
//       <div className="relative flex flex-col justify-between items-center bg-gray-800 p-4 rounded-md shadow-lg space-y-5">
//         <h1 className="text-white text-2xl font-bold">YouTube Monitoring</h1>
//       </div>
//       <div className='mt-4'>
//         <div className="flex flex-col w-full gap-4 font-medium">
//           <Link
//             to="/home"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)} // Open popup when clicked
//           >
//             Check Your Stats
//           </Link>
//           <Link
//             to="/custom-values"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)} // Open popup when clicked
//           >
//             Set Custom Values
//           </Link>

//           {popUpOpen  && (
//             <div className="fixed top-0 right-0 p-4">
//               <Link
//                 to="/"
//                 className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//                 onClick={() => setPopUpOpen(false)} // Close popup when clicked
//               >
//                 Go Back
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;


// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';

// const HomePage: React.FC = () => {
//   const [popUpOpen, setPopUpOpen] = useState(false);
//   const location = useLocation();

//   return (
//     <div className="bg-gray-900 p-4 min-w-[400px]">
//       <div className="relative flex flex-col justify-between items-center bg-gray-800 p-4 rounded-md shadow-lg space-y-5">
//         <h1 className="text-white text-2xl font-bold">YouTube Monitoring</h1>
//       </div>
//       <div className='mt-4'>
//         <div className="flex flex-col w-full gap-4 font-medium">
//           <Link
//             to="/home"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)}
//           >
//             Check Your Stats
//           </Link>
//           <Link
//             to="/custom-values"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)}
//           >
//             Set Custom Values
//           </Link>

//           {popUpOpen && location.pathname !== '/' && (
//             <div className="fixed top-0 right-0 p-4">
//               <Link
//                 to="/"
//                 className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//                 onClick={() => setPopUpOpen(false)}
//               >
//                 Go Back
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;


// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { DataContext } from '../context/dataContext';

// const HomePage:React.FC = () => {
//     const {setPopUpOpen} = useContext(DataContext)!;

//   return (
//     <div className="bg-gray-900 p-4 min-w-[400px]">
//       <div className="relative flex flex-col justify-between items-center bg-gray-800 p-4 rounded-md shadow-lg space-y-5">
//         <h1 className="text-white text-2xl font-bold">YouTube Monitoring</h1>
//       </div>
//       <div className='mt-4'>
//         <div className="flex flex-col w-full gap-4 font-medium">
//           <Link
//             to="/home"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)}
//           >
//             Check Your Stats
//           </Link>
//           <Link
//             to="/custom-values"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)}
//           >
//             Set Custom Values
//           </Link>

//           <Link
//             to="/wallet"
//             className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//             onClick={() => setPopUpOpen(true)}
//           >
//             My Wallet
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;


import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DataContext } from '../context/dataContext';

const HomePage: React.FC = () => {
  const { setPopUpOpen } = useContext(DataContext)!;

  return (
    <div className="bg-gray-900 p-6 flex flex-col items-center">
      <div className="relative flex flex-col justify-center items-center bg-gray-800 p-6 rounded-lg shadow-md space-y-4 w-full">
    <h1 className="text-white text-2xl font-extrabold w-full text-center">YouTube Monitoring</h1>
        <p className="text-gray-400 text-md text-center">Track your educational and fun content consumption with ease.</p>
      </div>
      <div className='mt-8 w-full max-w-md'>
        <div className="flex flex-col w-full gap-4 font-medium">
          <Link
            to="/home"
            className="bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setPopUpOpen(true)}
          >
            Check Your Stats
          </Link>
          <Link
            to="/custom-values"
            className="bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setPopUpOpen(true)}
          >
            Set Custom Values
          </Link>
          <Link
            to="/wallet"
            className="bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setPopUpOpen(true)}
          >
            My Wallet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

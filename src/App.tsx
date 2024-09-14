// // import React, { useState } from 'react';
// // import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// // import Home from './pages/Home'; // Example of another component
// // import Productivity from './pages/Productivity';
// // import CustomValues from './pages/CustomValues';
// // import './index.css';

// // const App: React.FC = () => {
// //   const [popUpOpen,setPopUpOpen] = useState<boolean>(false);
// //   return (
// //     <Router>
// //       <div style={{width:400}}>
// //         {!popUpOpen && <nav style={{height:30}}>
// //         {/* {!popUpOpen && <nav style={{height:30}}> */}
// //           <ul>
// //             <li>
// //               <Link to="/" onClick={()=>setPopUpOpen(true)}>Check Your Stats</Link>
// //              </li>
// //             <li>
// //               <Link to="/custom-values" onClick={()=>setPopUpOpen(true)}>Set Custom Values</Link>
// //              </li>
// //           </ul>
// //         </nav> }
// //         {popUpOpen && <Link to="#" onClick={()=>setPopUpOpen(false)}>Go Back</Link>}
       
// //         <Routes>
// //           <Route path="/" element={<Home />} />
// //           <Route path="/productivity" element={<Productivity />} />
// //           <Route path="/custom-values" element={<CustomValues />} />
// //         </Routes>
// //       </div>
// //     </Router>
// //   );
// // };

// // export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Home from './pages/Home'; // Example of another component
// import Productivity from './pages/Productivity';
// import CustomValues from './pages/CustomValues';
// import './index.css';
// import HomePage from './pages/HomePage';

// const App: React.FC = () => {

//   return (
//     <div>
//     <Router>
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/home" element={<Home />} />
//             <Route path="/productivity" element={<Productivity />} />
//             <Route path="/custom-values" element={<CustomValues />} />
//           </Routes>
//     </Router>
//     </div>
//   );
// };

// export default App;


// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import Home from './pages/Home';
// import Productivity from './pages/Productivity';
// import CustomValues from './pages/CustomValues';
// import HomePage from './pages/HomePage';
// import './index.css';

// const App = () => {
//   const [popUpOpen, setPopUpOpen] = useState(false);
//   const location = useLocation();

//   return (
//     <div className="app-container">
//       <Router>
//         <div className="flex flex-col h-screen">
//           {/* {!popUpOpen && location.pathname !== '/' && (
//             <nav className="flex justify-between items-center bg-gray-800 p-4">
//               <Link
//                 to="/home"
//                 className="text-white"
//                 onClick={() => setPopUpOpen(true)}
//               >
//                 Check Your Stats
//               </Link>
//               <Link
//                 to="/custom-values"
//                 className="text-white"
//                 onClick={() => setPopUpOpen(true)}
//               >
//                 Set Custom Values
//               </Link>
//             </nav>
//           )} */}
//           <HomePage/>

//           {popUpOpen && (
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

//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/home" element={<Home />} />
//             <Route path="/productivity" element={<Productivity />} />
//             <Route path="/custom-values" element={<CustomValues />} />
//           </Routes>
//         </div>
//       </Router>
//     </div>
//   );
// };

// export default App;


import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Productivity from './pages/Productivity';
import CustomValues from './pages/CustomValues';
import './index.css';
import WalletPage from './pages/WalletPage';
import HomePage from './pages/HomePage';
import { DataContext } from './context/dataContext';

const App = () => {
  const {popUpOpen} = useContext(DataContext)!;

  return (
    <Router>
      <div className="app-container w-[400px]">
       
        {!popUpOpen && <HomePage/>}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/custom-values" element={<CustomValues />} />
          <Route path="/wallet" element={<WalletPage />} /> {/* Add this line */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;


// import React, { useContext, useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
// import Home from './pages/Home';
// import Productivity from './pages/Productivity';
// import CustomValues from './pages/CustomValues';
// import './index.css';
// import HomePage from './pages/HomePage';
// import { DataContext } from './context/dataContext';

// const App = () => {
//   const {popUpOpen,setPopUpOpen} = useContext(DataContext)!;
//   const navigate = useNavigate();

//   // Function to handle "Go Back" click
//   const handleGoBack = () => {
//     navigate('/');
//     setPopUpOpen(false);
//   };

//   // Determine if the "Go Back" button should be shown
  

//   return (
//     <div className="app-container w-[400px]">
//       <Router>
//         {/* Navigation */}
//         {!popUpOpen && <HomePage/>}
//         {popUpOpen && (
//           <div className="fixed top-0 right-0 p-4">
//             <button
//               className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//               onClick={handleGoBack}
//             >
//               Go Back
//             </button>
//           </div>
//         )}
        
//         <Routes>         
//           <Route path="/" element={<HomePage />} /> 
//           <Route path="/home" element={<Home />} />
//           <Route path="/productivity" element={<Productivity />} />
//           <Route path="/custom-values" element={<CustomValues />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// };

// export default App;


// import React, { useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
// import Home from './pages/Home';
// import Productivity from './pages/Productivity';
// import CustomValues from './pages/CustomValues';
// import './index.css';
// import HomePage from './pages/HomePage';
// import { DataContext } from './context/dataContext';

// const App: React.FC = () => {
//   const { popUpOpen, setPopUpOpen } = useContext(DataContext)!;
//   const navigate = useNavigate();

//   // Function to handle "Go Back" click
//   const handleGoBack = () => {
//     navigate('/');
//     setPopUpOpen(false);
//   };

//   // Determine if the "Go Back" button should be shown

//   return (
//     <div className="app-container w-[400px]">
//       <Router>
//         {/* Conditional Rendering for Pop-Up */}
//         {!popUpOpen && <HomePage />}
        
//         {/* "Go Back" Button */}
//         {popUpOpen && (
//           <div className="fixed top-0 right-0 p-4">
//             <button
//               className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md transition duration-300"
//               onClick={handleGoBack}
//             >
//               Go Back
//             </button>
//           </div>
//         )}
        
//         {/* Routes */}
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/home" element={<Home />} />
//           <Route path="/productivity" element={<Productivity />} />
//           <Route path="/custom-values" element={<CustomValues />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// };

// export default App;


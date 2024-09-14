// import React,{useContext} from 'react';
// import PieChart from '../Components/PieChart';
// import { DataContext } from '../context/dataContext';

// const Productivity: React.FC = () => {

//   const {percentFun,percentStudy} = useContext(DataContext)!;
//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Productivity Analysis</h2>
//       <PieChart />
//       <div style={{ marginTop: '20px' }}>
//         <h3>Summary</h3>
//         <p>Educational Content: {percentStudy.toFixed(2)}</p>
//         <p>Non-Educational Content: {percentFun.toFixed(2)}</p>
//         {percentFun<percentStudy?<p>This chart shows that you are spending more time on educational content, which is great for your productivity!</p>:<p>This chart shows that you are spending more time on non educational content, which is not good for your productivity!</p>}
//       </div>
//     </div>
//   );
// };

// export default Productivity;


import React, { useContext } from 'react';
import PieChart from '../Components/PieChart';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/dataContext';
import { FaArrowLeft } from 'react-icons/fa';

const Productivity: React.FC = () => {
  const { percentFun, percentStudy } = useContext(DataContext)!;
  const navigate = useNavigate();
  function handleBack(){
    navigate('/');
  }
  return (
    <div className="bg-gray-900 min-h-screen text-white p-4">
      {/* <h2 className="text-3xl font-bold text-center mb-8"></h2> */}
      <div className="relative flex justify-between items-center bg-gray-800 p-4 rounded-md shadow-lg w-full">
        <h1 className="text-white text-2xl font-bold">Productivity Analysis</h1>
        <button   className='hover:bg-gray-700 p-2 rounded-md' onClick={()=>{handleBack()}}>
          <FaArrowLeft className="text-white text-xl" />
        </button>
      </div>
      <div className="flex justify-center mb-12 mt-3">
        <PieChart />
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Summary</h3>
        <p className="text-lg mb-2">Educational Content: <span className="font-bold text-blue-400">{percentStudy.toFixed(2)}%</span></p>
        <p className="text-lg mb-4">Non-Educational Content: <span className="font-bold text-red-400">{percentFun.toFixed(2)}%</span></p>
        
        {percentFun < percentStudy ? (
          <p className="text-green-400 text-lg">
            This chart shows that you are spending more time on educational content, which is great for your productivity!
          </p>
        ) : (
          <p className="text-red-400 text-lg">
            This chart shows that you are spending more time on non-educational content, which is not good for your productivity!
          </p>
        )}
      </div>
    </div>
  );
};

export default Productivity;


// import React, { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { DataContext } from '../context/dataContext';
// import PieChart from '../Components/PieChart';
// import { FaArrowLeft, FaBook, FaSmile } from 'react-icons/fa';

// const Productivity: React.FC = () => {
//   const { percentFun, percentStudy } = useContext(DataContext)!;
//   const navigate = useNavigate();
  
//   function handleBack(){
//     navigate('/');
//   }

//   return (
//     <div className="bg-gray-900 min-h-screen text-white p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md mb-6">
//         <h1 className="text-2xl font-bold">Productivity Analysis</h1>
//         <button 
//           className="flex items-center text-gray-400 hover:text-white transition duration-300"
//           onClick={handleBack}
//         >
//           <FaArrowLeft className="text-lg mr-2" />
//           Back
//         </button>
//       </div>

//       {/* Pie Chart */}
//       <div className="flex justify-center mb-8">
//         <div className="w-72 h-72 bg-gray-800 p-4 rounded-full shadow-lg flex items-center justify-center">
//           <PieChart />
//         </div>
//       </div>

//       {/* Summary Section */}
//       <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto">
//         <h2 className="text-xl font-semibold mb-4">Summary</h2>
//         <div className="flex justify-between mb-4">
//           <p className="flex items-center text-lg">
//             <FaBook className="text-blue-400 mr-2" />
//             Educational Content:
//             <span className="font-bold text-blue-400"> {percentStudy.toFixed(2)}%</span>
//           </p>
//           <p className="flex items-center text-lg">
//             <FaSmile className="text-red-400 mr-2" />
//             Non-Educational Content:
//             <span className="font-bold text-red-400"> {percentFun.toFixed(2)}%</span>
//           </p>
//         </div>

//         {/* Feedback */}
//         <p className="text-lg mt-2">
//           {percentFun < percentStudy ? (
//             <span className="text-green-400">
//               Great job! You are spending more time on educational content.
//             </span>
//           ) : (
//             <span className="text-red-400">
//               You might want to balance your time better, as more time is spent on non-educational content.
//             </span>
//           )}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Productivity;

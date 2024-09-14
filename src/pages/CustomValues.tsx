// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const CustomValues: React.FC = () => {
//     const [customValue, setCustomValue] = useState<number>(30);
//     const [inputValue, setInputValue] = useState<number>(30);

//     const navigate = useNavigate();
//     function handleBack(){
//       navigate('/');
//     }

//     // const handleAddValue = () => {
//     //     if (inputValue.trim()) {
//     //         setCustomValue(inputValue.trim());
//     //         setInputValue('');
//     //     }
//     // };
    
//     const handleInputChange=(event: { target: { value: string; }; })=>{
//         const num = parseInt(event.target.value,10);
//        setInputValue(num);
//     }

//     return (
//         <div className="bg-gray-900  flex flex-col items-center justify-center text-white p-6 gap-3">
//         <div className='w-full h-18 border border-white border-solid flex justify-between items-center p-3'>
//             <h1 className="text-4xl font-bold  text-red-600 ">Custom Value</h1>
//             <button className='hover:bg-gray-500 p-1 border rounded-sm' onClick={()=>{handleBack()}}>Back</button>            </div>
//             {/* {customValue && ( */}
//                 <div className="mt-2 text-center bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md">
//                     <h2 className="text-2xl font-semibold text-red-600">Your Current Fun Time Limit:</h2>
//                    <p className='text-lg'>{customValue} minutes</p>
//                     {/* <p className="text-xl mt-2 text-white">{inputValue<=60}?{inputValue}minutes:Enter the minutes in range from 0 to 60!</p> */}
//                     <p className="text-md mt-2 text-white">(For watching 1 hr of educational content)</p>
//                 </div>
//             {/* )} */}

//             <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
//                 <input
//                     type="number"
//                     value={inputValue}
//                     onChange={handleInputChange}
//                     placeholder="Enter a value..."
//                     className="w-full p-3 mb-4 text-gray-900 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-red-600"
//                 />
//                 <button
//                     onClick={()=>{if(inputValue<=60){setCustomValue(inputValue)}}}
//                     className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-md transition duration-300 w-full"
//                 >
//                     Update 
//                 </button>
//                 {inputValue>60?<p className='mt-3 text-red-600'>Enter the minutes in range from 0 to 60!</p>:''}
//             </div>
       
//         </div>
//     );
// };

// export default CustomValues;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const CustomValues: React.FC = () => {
  const [customValue, setCustomValue] = useState<number>(60);
  const [inputValue, setInputValue] = useState<number>(60);

  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  const handleInputChange = (event: { target: { value: string; }; }) => {
    const num = parseInt(event.target.value, 10);
    setInputValue(num);
  };

  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center text-white p-6 gap-6 min-h-screen">
      <div className="w-full h-20 flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-md shadow-md">
        <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
          <FaEdit /> Custom Value
        </h1>
        <button 
          className='hover:bg-gray-700 p-2 rounded-md'
          onClick={handleBack}
        >
          <FaArrowLeft className="text-white text-xl" />
        </button>
      </div>

      <div className="mt-4 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-red-500">Current Fun Time Limit:</h2>
        <p className='text-xl font-bold mt-2'>{customValue} minutes</p>
        <p className="text-md mt-2 text-gray-300">(For watching 1 hr of educational content)</p>
      </div>

      <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter a value..."
          className="w-full p-3 mb-4 text-gray-900 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={() => { if (inputValue <= 60) setCustomValue(inputValue); }}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-md transition duration-300 w-full"
        >
          Update
        </button>
        {inputValue > 60 && <p className='mt-3 text-red-500'>Enter the minutes in the range from 0 to 60!</p>}
      </div>
    </div>
  );
};

export default CustomValues;

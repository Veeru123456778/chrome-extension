import React, { ReactNode, useState,useEffect } from "react";
import {DataContext} from "./dataContext";

interface DataContextProviderProps{
  children:ReactNode
}

const DataContextProvider: React.FC<DataContextProviderProps> = ({ children }) => {
  const [funTime, setFunTime] = useState<number>(0);
  const [studyTime, setStudyTime] = useState<number>(0);
  const [percentFun, setPercentFun] = useState<number>(0);
  const [percentStudy, setPercentStudy] = useState<number>(0);
  const [popUpOpen, setPopUpOpen] = useState<boolean>(false);

  useEffect(() => {
    const calculatePercentages = () => {
      const totalTime = funTime + studyTime;
      setPercentFun(totalTime > 0 ? (funTime / totalTime) * 100 : 0);
      setPercentStudy(totalTime > 0 ? (studyTime / totalTime) * 100 : 0);
    };

    calculatePercentages();
  }, [funTime, studyTime]);

  
    const  getTime =()=>{
    // Request the initial global times when the component mounts
    chrome.runtime.sendMessage({ action: 'GET_INITIAL_GLOBAL_TIMES' });
    // Listen for the initial global times
    const messageListener = (request: any) => {
      if (request.action === 'INITIAL_GLOBAL_TIMES') {
        setFunTime(request.globalFunTime);
        setStudyTime(request.globalStudyTime);
      } else if (request.videoCategory) {
        if (request.videoCategory === 'NonEducational') {
          setFunTime(request.updatedTime);
        } else if (request.videoCategory === 'Educational') {
          setStudyTime(request.updatedTime);
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Clean up the listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }

  useEffect(() => {
  getTime();
  }, []);

  function formatTime(time:number){
    const hour = Math.floor(time / 3600);
    const mins = Math.floor(( time% 3600) / 60);
    const sec = Math.floor(time % 60);
    return {hour,mins,sec};
  }

  return (
    <DataContext.Provider value={{ funTime, studyTime, setFunTime, setStudyTime,getTime,formatTime,percentFun ,percentStudy,popUpOpen,setPopUpOpen}}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;

// import React, { ReactNode, useState,useEffect } from "react";
// import {DataContext,Time} from "./dataContext";

// interface DataContextProviderProps{
//   children:ReactNode
// }

// const DataContextProvider: React.FC<DataContextProviderProps> = ({ children }) => {
//   const [funTime, setFunTime] = useState<Time>({hour:0,mins:0,sec:0});
//   const [studyTime, setStudyTime] = useState<Time>({hour:0,mins:0,sec:0});

  
//     const  getTime =()=>{
//     // Request the initial global times when the component mounts
//     chrome.runtime.sendMessage({ action: 'GET_INITIAL_GLOBAL_TIMES' });
//     // Listen for the initial global times
//     const messageListener = (request: any) => {
//       if (request.action === 'INITIAL_GLOBAL_TIMES') {
//         setFunTime(formatTime(request.globalFunTime));
//         setStudyTime(formatTime(request.globalStudyTime));
//       } else if (request.videoCategory) {
//         if (request.videoCategory === 'NonEducational') {
//           setFunTime(request.updatedTime);
//         } else if (request.videoCategory === 'Educational') {
//           setStudyTime(request.updatedTime);
//         }
//       }
//     };

//     chrome.runtime.onMessage.addListener(messageListener);

//     // Clean up the listener on component unmount
//     return () => {
//       chrome.runtime.onMessage.removeListener(messageListener);
//     };
//   }

//   useEffect(() => {
//   getTime();
//   }, []);

//   function formatTime(time:number){
//     const hour = Math.floor(time / 3600);
//     const mins = Math.floor(( time% 3600) / 60);
//     const sec = Math.floor(time % 60);
//     return {hour,mins,sec};
//   }

//   return (
//     <DataContext.Provider value={{ funTime, studyTime, setFunTime, setStudyTime,getTime,formatTime }}>
//       {children}
//     </DataContext.Provider>
//   );
// };

// export default DataContextProvider;


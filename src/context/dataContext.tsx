import  { createContext } from "react";


// interface Time{
//     hour:number,
//     mins:number,
//     sec:number
//     }

 type setStateType = React.Dispatch<React.SetStateAction<number>>;
 type popUpType = React.Dispatch<React.SetStateAction<boolean>>;

interface DataContextType{
studyTime:number ,
funTime :number ,
setStudyTime : setStateType,
setFunTime:setStateType,
getTime:Function,
formatTime:Function,
percentFun:number ,
percentStudy:number,
popUpOpen:boolean,
setPopUpOpen:popUpType
}
const DataContext = createContext<DataContextType | undefined>(undefined);

export  {DataContext};


// import  { createContext } from "react";


// interface Time{
//     hour:number,
//     mins:number,
//     sec:number
//     }

//  type setStateType = React.Dispatch<React.SetStateAction<Time>>;

// interface DataContextType{
// studyTime:Time ,
// funTime :Time ,
// setStudyTime : setStateType,
// setFunTime:setStateType
// getTime:Function,
// }
// const DataContext = createContext<DataContextType | undefined>(undefined);

// export  {DataContext,Time};
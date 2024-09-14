// import React, { useRef, useEffect } from 'react';
// import Chart from 'chart.js/auto';

// const PieChart: React.FC = () => {
//   const chartRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (chartRef.current) {
//       const myChart = new Chart(chartRef.current, {
//         type: 'pie', // Choose the type of chart: 'bar', 'line', 'pie', etc.
//         data: {
//           labels: ['Educational Content', 'Non Educational Content'],
//           datasets: [
//             {
//               label: 'My Productivity',
//               backgroundColor: ['rgba(0, 255, 81, 0.8)',
//               'rgba(255, 0, 0, 0.9)'
//               ],
//               borderColor:['rgba(0, 255, 81, 0.8)',
//               'rgba(255, 0, 0, 0.9)'
//               ] ,
//               borderWidth: 1,
//               data: [65, 59],
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//         },
//       });

//       return () => {
//         // Clean up on unmount
//         myChart.destroy();
//       };
//     }
//   }, []);

//   return <canvas ref={chartRef} />;
// };

// export default PieChart;

// import React, { useRef, useEffect,useContext, useState } from 'react';
// import Chart from 'chart.js/auto';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { DataContext } from '../context/dataContext';

// const PieChart: React.FC = () => {
//   const chartRef = useRef<HTMLCanvasElement>(null);

//   const [fTime,setFTime] = useState(0);
//   const [sTime,setSTime] = useState(0);

//   const {funTime,studyTime} = useContext(DataContext)!;
  
//   useEffect(()=>{
//     const percentFun = (funTime/(funTime+studyTime))*100;
//     const percentStudy = (studyTime/(funTime+studyTime))*100;
//     setFTime(percentFun);
//     setSTime(percentStudy);
//   },[funTime,studyTime]);

//   useEffect(() => {
//     if (chartRef.current) {
//       const myChart:Chart = new Chart(chartRef.current, {
//         type: 'pie',
//         data: {
//           labels: ['Educational Content', 'Non-Educational Content'],
//           datasets: [
//             {
//               label: 'My Productivity',
//               backgroundColor: [
//                 'rgba(0, 255, 81, 0.8)',
//                 'rgba(255, 0, 0, 0.9)',
//               ],
//               borderColor: [
//                 'rgba(0, 255, 81, 1)',
//                 'rgba(255, 0, 0, 1)',
//               ],
//               borderWidth: 1,
//               data: [fTime,sTime],
//             },
//           ],
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             legend: {
//               display: true,
//               position: 'bottom',
//             },
//             tooltip: {
//               callbacks: {
//                 label: function (tooltipItem) {
//                   const dataset = tooltipItem.dataset;
//                   const data = dataset.data as number[];
//                   const currentValue = data[tooltipItem.dataIndex] as number;
//                   const total = data.reduce((acc: number, value: number) => acc + value, 0);
//                   const percentage = (currentValue / total) * 100;
//                   return `${tooltipItem.label}: ${percentage.toFixed(2)}%`;
//                 },
//               },
//             },
//             datalabels: {
//               color: '#fff',
//               formatter: (value, ctx) => {
//                 const data = ctx.dataset.data as number[];
//                 const total = data.reduce((acc: number, val: number) => acc + val, 0);
//                 const percentage = (value / total) * 100;
//                 return `${percentage.toFixed(2)}%`;
//               },
//             },
//           },
//         },
//         plugins: [ChartDataLabels], // Register the datalabels plugin
//       });

//       return () => {
//         myChart.destroy();
//       };
//     }
//   }, []);

//   return <canvas ref={chartRef} />;
// };

// export default PieChart;

import React, { useRef, useEffect, useContext, useState } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DataContext } from '../context/dataContext';

const PieChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  const { funTime, studyTime,percentFun,percentStudy } = useContext(DataContext)!;

  useEffect(() => {
   
    if (chartInstance) {
      chartInstance.data.datasets[0].data = [percentFun, percentStudy];
      chartInstance.update();
    } else if (chartRef.current) {
      const newChart = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Educational Content', 'Non-Educational Content'],
          datasets: [
            {
              label: 'My Productivity',
              backgroundColor: [
                'rgba(0, 255, 81, 0.8)',
                'rgba(255, 0, 0, 0.9)',
              ],
              borderColor: [
                'rgba(0, 255, 81, 1)',
                'rgba(255, 0, 0, 1)',
              ],
              borderWidth: 1,
              data: [percentStudy,percentFun],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const dataset = tooltipItem.dataset;
                  const data = dataset.data as number[];
                  const currentValue = data[tooltipItem.dataIndex] as number;
                  const total = data.reduce((acc: number, value: number) => acc + value, 0);
                  const percentage = (currentValue / total) * 100;
                  return `${tooltipItem.label}: ${percentage.toFixed(2)}%`;
                },
              },
            },
            datalabels: {
              color: '#fff',
              formatter: (value, ctx) => {
                const data = ctx.dataset.data as number[];
                const total = data.reduce((acc: number, val: number) => acc + val, 0);
                const percentage = (value / total) * 100;
                return `${percentage.toFixed(2)}%`;
              },
            },
          },
        },
        plugins: [ChartDataLabels], // Register the datalabels plugin
      });

      setChartInstance(newChart);
    }
  }, [funTime, studyTime]); // Re-run effect when funTime or studyTime changes

  return <canvas ref={chartRef} />;
};

export default PieChart;

import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './App.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const App = () => {
  const [data, setData] = useState({
    stats: {
      totalStudyTime: 0,
      totalFunTime: 0,
      dailyStudyTime: 0,
      dailyFunTime: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    },
    settings: {
      studyArea: null,
      funTimeLimit: 20,
      isFirstTime: true,
      notifications: true
    },
    remainingFunTime: 0,
    isLoading: true
  });

  const [currentView, setCurrentView] = useState('home');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh data every 5 seconds
    refreshIntervalRef.current = window.setInterval(loadData, 5000);
    
    return () => {
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
      const settingsResponse = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      
      setData(prevData => ({
        ...prevData,
        stats: response.stats,
        settings: settingsResponse,
        remainingFunTime: response.remainingFunTime,
        isLoading: false,
        error: undefined
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      setData(prevData => ({
        ...prevData,
        isLoading: false,
        error: 'Failed to load data'
      }));
    }
  };

  const updateSettings = async (updates) => {
    try {
      await chrome.runtime.sendMessage({ 
        type: 'UPDATE_SETTINGS',
        data: updates
      });
      await loadData();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeShort = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStudyAreas = () => [
    { id: 'computer-science', name: 'Computer Science' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'business', name: 'Business' },
    { id: 'history', name: 'History' },
    { id: 'literature', name: 'Literature' },
    { id: 'psychology', name: 'Psychology' },
    { id: 'philosophy', name: 'Philosophy' }
  ];

  const pieChartData = {
    labels: ['Study Time', 'Fun Time'],
    datasets: [
      {
        data: [data.stats.dailyStudyTime, data.stats.dailyFunTime],
        backgroundColor: ['#4CAF50', '#FF9800'],
        borderColor: ['#45a049', '#f57c00'],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: ['Study Time', 'Fun Time'],
    datasets: [
      {
        label: 'Today',
        data: [data.stats.dailyStudyTime, data.stats.dailyFunTime],
        backgroundColor: ['#4CAF50', '#FF9800'],
        borderColor: ['#45a049', '#f57c00'],
        borderWidth: 1,
      },
      {
        label: 'Total',
        data: [data.stats.totalStudyTime, data.stats.totalFunTime],
        backgroundColor: ['#81C784', '#FFB74D'],
        borderColor: ['#66BB6A', '#FFA726'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#030303',
          font: {
            family: 'YouTube Sans, Roboto, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            return `${label}: ${formatTime(value)}`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatTimeShort(value),
          color: '#606060',
          font: {
            family: 'YouTube Sans, Roboto, sans-serif',
            size: 11
          }
        },
        grid: {
          color: '#e5e5e5'
        }
      },
      x: {
        ticks: {
          color: '#606060',
          font: {
            family: 'YouTube Sans, Roboto, sans-serif',
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (data.isLoading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="app-container">
        <div className="error">
          <p>Error: {data.error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  if (data.settings.isFirstTime || !data.settings.studyArea) {
    return (
      <div className="app-container">
        <div className="setup-container">
          <h2>Welcome to YouTube Study Tracker!</h2>
          <p>Let's set up your study preferences to get started.</p>
          
          <div className="setup-form">
            <label>
              Study Area:
              <select 
                value={data.settings.studyArea?.id || ''} 
                onChange={(e) => {
                  const selected = getStudyAreas().find(area => area.id === e.target.value);
                  updateSettings({ studyArea: selected });
                }}
              >
                <option value="">Select your study area</option>
                {getStudyAreas().map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              Fun Time Limit (minutes per hour of study):
              <input 
                type="number" 
                min="5" 
                max="60" 
                value={data.settings.funTimeLimit}
                onChange={(e) => updateSettings({ funTimeLimit: parseInt(e.target.value) })}
              />
            </label>
            
            <label>
              <input 
                type="checkbox" 
                checked={data.settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
              />
              Enable notifications
            </label>
            
            {data.settings.studyArea && (
              <button 
                className="save-button"
                onClick={() => updateSettings({ isFirstTime: false })}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>YouTube Study Tracker</h1>
        <div className="nav-tabs">
          <button 
            className={currentView === 'home' ? 'active' : ''}
            onClick={() => setCurrentView('home')}
          >
            Dashboard
          </button>
          <button 
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => setCurrentView('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      {currentView === 'home' && (
        <div className="dashboard">
          <div className="stats-grid">
            <div className="stat-card study">
              <h3>Study Time Today</h3>
              <div className="stat-value">{formatTime(data.stats.dailyStudyTime)}</div>
            </div>
            
            <div className="stat-card fun">
              <h3>Fun Time Today</h3>
              <div className="stat-value">{formatTime(data.stats.dailyFunTime)}</div>
            </div>
            
            <div className="stat-card remaining">
              <h3>Remaining Fun Time</h3>
              <div className="stat-value">{data.remainingFunTime}m</div>
            </div>
            
            <div className="stat-card total">
              <h3>Total Study Time</h3>
              <div className="stat-value">{formatTime(data.stats.totalStudyTime)}</div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <h3>Today's Time Distribution</h3>
              <div className="chart-wrapper">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Time Comparison</h3>
              <div className="chart-wrapper">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>

          <div className="study-area-info">
            <h3>Current Study Area: {data.settings.studyArea.name}</h3>
            <p>Fun time limit: {data.settings.funTimeLimit} minutes per hour of study</p>
          </div>
        </div>
      )}

      {currentView === 'settings' && (
        <div className="settings">
          <h2>Settings</h2>
          
          <div className="setting-group">
            <label>
              Study Area:
              <select 
                value={data.settings.studyArea?.id || ''} 
                onChange={(e) => {
                  const selected = getStudyAreas().find(area => area.id === e.target.value);
                  updateSettings({ studyArea: selected });
                }}
              >
                {getStudyAreas().map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="setting-group">
            <label>
              Fun Time Limit (minutes per hour of study):
              <input 
                type="number" 
                min="5" 
                max="60" 
                value={data.settings.funTimeLimit}
                onChange={(e) => updateSettings({ funTimeLimit: parseInt(e.target.value) })}
              />
            </label>
          </div>
          
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={data.settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
              />
              Enable notifications
            </label>
          </div>
          
          {!data.settings.youtubeApiKey && (
            <div className="setting-group">
              <button onClick={() => setShowApiKeyInput(!showApiKeyInput)}>
                {showApiKeyInput ? 'Cancel' : 'Add YouTube API Key (Optional)'}
              </button>
              
              {showApiKeyInput && (
                <div className="api-key-input">
                  <p>Adding a YouTube API key will improve video classification accuracy.</p>
                  <input 
                    type="password" 
                    placeholder="Enter YouTube API Key"
                    value={data.settings.youtubeApiKey || ''}
                    onChange={(e) => updateSettings({ youtubeApiKey: e.target.value })}
                  />
                  <small>
                    Get your API key from{' '}
                    <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer">
                      Google Cloud Console
                    </a>
                  </small>
                </div>
              )}
            </div>
          )}
          
          <div className="setting-group">
            <button 
              className="reset-button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                  chrome.runtime.sendMessage({ type: 'RESET_DATA' });
                }
              }}
            >
              Reset All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
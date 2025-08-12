import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './App.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface TimeStats {
  totalStudyTime: number;
  totalFunTime: number;
  dailyStudyTime: number;
  dailyFunTime: number;
  lastResetDate: string;
}

interface Settings {
  studyArea: { id: string; name: string } | null;
  funTimeLimit: number;
  isFirstTime: boolean;
  youtubeApiKey?: string;
  notifications: boolean;
}

interface AppData {
  stats: TimeStats;
  settings: Settings;
  remainingFunTime: number;
  isLoading: boolean;
  error?: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({
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

  const [currentView, setCurrentView] = useState<'home' | 'settings' | 'history'>('home');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const refreshIntervalRef = useRef<number | null>(null);

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

  const updateSettings = async (updates: Partial<Settings>) => {
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

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateProductivity = (): number => {
    const total = data.stats.dailyStudyTime + data.stats.dailyFunTime;
    if (total === 0) return 100;
    return Math.round((data.stats.dailyStudyTime / total) * 100);
  };

  const getPieChartData = () => {
    const studyMinutes = Math.round(data.stats.dailyStudyTime / 60);
    const funMinutes = Math.round(data.stats.dailyFunTime / 60);
    
    if (studyMinutes === 0 && funMinutes === 0) {
      return {
        labels: ['No activity today'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e0e0e0'],
          borderWidth: 0
        }]
      };
    }

    return {
      labels: ['Study Time', 'Fun Time'],
      datasets: [{
        data: [studyMinutes, funMinutes],
        backgroundColor: ['#4ecdc4', '#ff6b6b'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  };

  const getBarChartData = () => {
    const studyHours = data.stats.totalStudyTime / 3600;
    const funHours = data.stats.totalFunTime / 3600;
    
    return {
      labels: ['Total Time'],
      datasets: [
        {
          label: 'Study Hours',
          data: [studyHours],
          backgroundColor: '#4ecdc4',
          borderRadius: 8
        },
        {
          label: 'Fun Hours', 
          data: [funHours],
          backgroundColor: '#ff6b6b',
          borderRadius: 8
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw;
            return `${label}: ${value} minutes`;
          }
        }
      }
    }
  };

  const HomeView = () => (
    <div className="home-view">
      <div className="header">
        <div className="productivity-circle">
          <div className="circle-content">
            <span className="percentage">{calculateProductivity()}%</span>
            <span className="label">Productive</span>
          </div>
        </div>
        <div className="time-summary">
          <div className="time-item study">
            <span className="icon">📚</span>
            <div>
              <div className="time-value">{formatTime(data.stats.dailyStudyTime)}</div>
              <div className="time-label">Study Today</div>
            </div>
          </div>
          <div className="time-item fun">
            <span className="icon">🎉</span>
            <div>
              <div className="time-value">{formatTime(data.stats.dailyFunTime)}</div>
              <div className="time-label">Fun Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Today's Activity</h3>
        <div className="chart-wrapper">
          <Pie data={getPieChartData()} options={chartOptions} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(data.remainingFunTime)}</div>
            <div className="stat-label">Minutes Fun Left</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(data.stats.totalStudyTime)}</div>
            <div className="stat-label">Total Study</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{data.settings.studyArea?.name || 'Not Set'}</div>
            <div className="stat-label">Study Area</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <div className="stat-value">{data.settings.funTimeLimit}m</div>
            <div className="stat-label">Fun Limit/Hour</div>
          </div>
        </div>
      </div>

      {data.remainingFunTime <= 5 && data.stats.dailyFunTime > 0 && (
        <div className="warning-card">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <div className="warning-title">Fun Time Almost Up!</div>
            <div className="warning-message">
              Only {Math.round(data.remainingFunTime)} minutes of fun time remaining today.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SettingsView = () => (
    <div className="settings-view">
      <h3>⚙️ Settings</h3>
      
      <div className="setting-group">
        <label>📚 Study Area</label>
        <select 
          value={data.settings.studyArea?.name || ''}
          onChange={(e) => {
            if (e.target.value) {
              updateSettings({
                studyArea: { 
                  id: e.target.value.toLowerCase(),
                  name: e.target.value 
                }
              });
            }
          }}
        >
          <option value="">Select study area...</option>
          <option value="Computer Science">💻 Computer Science</option>
          <option value="Medical">🩺 Medical / Healthcare</option>
          <option value="Law">⚖️ Law</option>
          <option value="Business">💼 Business</option>
          <option value="Engineering">🔧 Engineering</option>
          <option value="Mathematics">🔢 Mathematics</option>
          <option value="Physics">⚛️ Physics</option>
          <option value="Chemistry">🧪 Chemistry</option>
          <option value="Biology">🧬 Biology</option>
          <option value="Psychology">🧠 Psychology</option>
          <option value="History">📜 History</option>
          <option value="Literature">📖 Literature</option>
          <option value="Art">🎨 Art</option>
          <option value="Music">🎵 Music</option>
        </select>
      </div>

      <div className="setting-group">
        <label>⏰ Fun Time Limit (minutes per hour of study)</label>
        <div className="slider-container">
          <input
            type="range"
            min="5"
            max="30"
            value={data.settings.funTimeLimit}
            onChange={(e) => updateSettings({ funTimeLimit: parseInt(e.target.value) })}
          />
          <div className="slider-labels">
            <span>5m</span>
            <span className={data.settings.funTimeLimit > 25 ? 'warning' : ''}>
              {data.settings.funTimeLimit}m {data.settings.funTimeLimit > 25 ? '⚠️' : ''}
            </span>
            <span>30m</span>
          </div>
        </div>
        {data.settings.funTimeLimit > 25 && (
          <div className="warning-text">
            ⚠️ High fun time limit may reduce productivity
          </div>
        )}
      </div>

      <div className="setting-group">
        <label>🔑 YouTube API Key (Optional)</label>
        <div className="api-key-section">
          {!showApiKeyInput ? (
            <button 
              className="secondary-button"
              onClick={() => setShowApiKeyInput(true)}
            >
              {data.settings.youtubeApiKey ? 'Update API Key' : 'Add API Key'}
            </button>
          ) : (
            <div>
              <input
                type="password"
                placeholder="Enter YouTube Data API v3 key..."
                defaultValue={data.settings.youtubeApiKey || ''}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    updateSettings({ youtubeApiKey: e.target.value.trim() });
                  }
                  setShowApiKeyInput(false);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
              />
              <div className="help-text">
                API key improves video categorization accuracy. 
                <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener">
                  Get API Key
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.settings.notifications}
            onChange={(e) => updateSettings({ notifications: e.target.checked })}
          />
          🔔 Enable Notifications
        </label>
      </div>
    </div>
  );

  const HistoryView = () => (
    <div className="history-view">
      <h3>📊 Total Statistics</h3>
      
      <div className="chart-container">
        <div className="chart-wrapper">
          <Bar 
            data={getBarChartData()} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const hours = context.raw.toFixed(1);
                      return `${context.dataset.label}: ${hours} hours`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Hours'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="total-stats">
        <div className="total-stat">
          <span className="total-icon">📚</span>
          <div>
            <div className="total-value">{formatTime(data.stats.totalStudyTime)}</div>
            <div className="total-label">Total Study Time</div>
          </div>
        </div>
        <div className="total-stat">
          <span className="total-icon">🎉</span>
          <div>
            <div className="total-value">{formatTime(data.stats.totalFunTime)}</div>
            <div className="total-label">Total Fun Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (data.isLoading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="app error">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{data.error}</p>
          <button onClick={loadData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 YouTube Study Tracker</h1>
        <nav className="nav-tabs">
          <button 
            className={currentView === 'home' ? 'active' : ''}
            onClick={() => setCurrentView('home')}
          >
            🏠 Home
          </button>
          <button 
            className={currentView === 'history' ? 'active' : ''}
            onClick={() => setCurrentView('history')}
          >
            📊 Stats
          </button>
          <button 
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => setCurrentView('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentView === 'home' && <HomeView />}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'history' && <HistoryView />}
      </main>

      <footer className="app-footer">
        <div className="footer-text">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div className="footer-links">
          <button onClick={() => chrome.tabs.create({ url: 'https://youtube.com' })}>
            📺 YouTube
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;


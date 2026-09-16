import React, { useState } from 'react';
import axios from 'axios';

const GSCConnect = () => {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gsc/connect', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthUrl(response.data.authorization_url);
    } catch (error) {
      console.error('Error getting authorization URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClick = () => {
    if (authUrl) {
      window.open(authUrl, '_blank', 'width=600,height=600');
    }
  };

  return (
    <div className="gsc-connect-container">
      <div className="card">
        <h2>Connect Google Search Console</h2>
        <p>Link your GSC account to enable automated domain verification</p>
        
        {!connected ? (
          <div className="connect-section">
            <button 
              onClick={handleConnect} 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Loading...' : 'Connect GSC Account'}
            </button>
            {authUrl && (
              <button 
                onClick={handleAuthClick}
                className="btn btn-secondary"
              >
                Open Authorization Page
              </button>
            )}
          </div>
        ) : (
          <div className="success-message">
            ✓ Google Search Console Connected
          </div>
        )}
      </div>
    </div>
  );
};

export default GSCConnect;

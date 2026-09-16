import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeploymentForm.css';

const DeploymentForm = () => {
  const [formData, setFormData] = useState({
    app_name: '',
    description: '',
    git_repo: '',
    property_url: '',
    target_platform: 'vercel'
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gsc/properties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/deploy', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeploymentStatus({
        success: true,
        deployment_id: response.data.deployment_id,
        message: response.data.message
      });
      // Reset form
      setFormData({
        app_name: '',
        description: '',
        git_repo: '',
        property_url: '',
        target_platform: 'vercel'
      });
    } catch (error) {
      setDeploymentStatus({
        success: false,
        message: error.response?.data?.error || 'Deployment failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deployment-form-container">
      <div className="card">
        <h2>Create New Deployment</h2>
        
        {deploymentStatus && (
          <div className={`alert alert-${deploymentStatus.success ? 'success' : 'error'}`}>
            {deploymentStatus.message}
            {deploymentStatus.deployment_id && (
              <p>Deployment ID: {deploymentStatus.deployment_id}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="app_name">Application Name *</label>
            <input
              type="text"
              id="app_name"
              name="app_name"
              value={formData.app_name}
              onChange={handleChange}
              placeholder="My Awesome App"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your application"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="git_repo">Git Repository URL</label>
            <input
              type="url"
              id="git_repo"
              name="git_repo"
              value={formData.git_repo}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="property_url">GSC Property URL *</label>
            <select
              id="property_url"
              name="property_url"
              value={formData.property_url}
              onChange={handleChange}
              required
            >
              <option value="">Select a verified property</option>
              {properties.map(prop => (
                <option key={prop.siteUrl} value={prop.siteUrl}>
                  {prop.siteUrl}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="target_platform">Deployment Platform *</label>
            <select
              id="target_platform"
              name="target_platform"
              value={formData.target_platform}
              onChange={handleChange}
              required
            >
              <option value="vercel">Vercel</option>
              <option value="netlify">Netlify</option>
              <option value="cloudflare">Cloudflare</option>
              <option value="aws">AWS</option>
              <option value="gcp">Google Cloud</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Deploying...' : 'Deploy Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeploymentForm;

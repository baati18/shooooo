import React, { useState, useEffect } from 'react';
import './styles.css';

// Backend URL - simplified
const BACKEND_URL = 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

function App() {
  const [currentPage, setCurrentPage] = useState('general-sales');
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // Admin authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });

  // Page descriptions and metadata
  const pageInfo = {
    'general-sales': {
      title: 'Deynta Caadiga Ah',
      description: 'Boggan waxaad ku aragtaa dhammaan iibka caadiga ah. Waxaad ku dari kartaa, wax ka badali kartaa, tirtiri kartaa, iyo raadin kartaa iibka.',
      icon: '💰',
      color: '#667eea',
      stats: 'Wadarta iibka maanta, iibkii ugu dambeeyay',
      instructions: 'Ku dar iib cusub adigoo buuxinaya magaca, waqtiga, taariikhda iyo lacagta'
    },
    'daily-breakdown': {
      title: 'Deynta Malinlaha',
      description: 'Boggan waxaad ku aragtaa faahfaahinta iibka maalinlaha ah. Waxaad ku kala saari kartaa iibka alaabta kala duwan.',
      icon: '📊',
      color: '#28a745',
      stats: 'Wadarta iibka maalin walba, alaabta ugu iibka badan',
      instructions: 'Ku dar alaab cusub oo maanta la iibiyay'
    },
    'customer-credit': {
      title: 'Lacag Macmiil Ku Hartay',
      description: 'Boggan waxaad ku maamuli kartaa dhammaan macmiilasha lacag kugu haraan. Waxaad raadin kartaa magaca macmiilka iyo lacagta uu kuugu haray.',
      icon: '💳',
      color: '#ffc107',
      stats: 'Wadarta lacagaha macmiilasha ku hayo, macmiilasha ugu badan',
      instructions: 'Ku dar macmiil cusub oo lacag kugu hartay'
    },
    'out-of-stock': {
      title: 'Maxaa Dhamaaday',
      description: 'Boggan waxaad ku aragtaa alaabta dhamaatay. Waxaad ku dari kartaa alaab cusub oo dhamaatay si aad u ogaatid inaad dalbasho.',
      icon: '📦',
      color: '#dc3545',
      stats: 'Tirada alaabta dhamaatay, alaabta ugu badan',
      instructions: 'Ku dar alaab cusub oo dhamaatay'
    }
  };

  // Check token on startup
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setShowAuthModal(true);
    }
  }, []);

  // Check backend connection on startup
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
        setAdmin(result.data);
        setShowAuthModal(false);
        loadData();
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setShowAuthModal(true);
    }
  };

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connected to backend:', data);
        setConnectionStatus('connected');
        setError(null);
        return;
      }
    } catch (err) {
      console.log('❌ Failed to connect to backend:', err.message);
    }
    
    setConnectionStatus('disconnected');
    setError('Could not connect to backend server. Please make sure it\'s running on port 5000');
  };

  const handleAuthInputChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = authMode === 'login' 
        ? `${API_URL}/admin/login`
        : `${API_URL}/admin/register`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authForm)
      });

      const result = await response.json();

      if (result.success) {
        if (authMode === 'login') {
          localStorage.setItem('token', result.data.token);
          setToken(result.data.token);
          setIsAuthenticated(true);
          setAdmin(result.data);
          setShowAuthModal(false);
          loadData();
        } else {
          setAuthMode('login');
          setAuthForm({
            username: '',
            email: '',
            password: '',
            fullName: ''
          });
          setError('Registration successful! Please login.');
        }
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err) {
      setError(`Failed to ${authMode}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setAdmin(null);
    setShowAuthModal(true);
  };

  // Get the correct API endpoint based on current page
  const getApiEndpoint = () => {
    switch(currentPage) {
      case 'general-sales':
        return `${API_URL}/general-sales`;
      case 'daily-breakdown':
        return `${API_URL}/daily-breakdown`;
      case 'customer-credit':
        return `${API_URL}/customer-credit`;
      case 'out-of-stock':
        return `${API_URL}/out-of-stock`;
      default:
        return `${API_URL}/general-sales`;
    }
  };

  // Load data from backend
  const loadData = async () => {
    if (connectionStatus !== 'connected' || !isAuthenticated || !token) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const endpoint = getApiEndpoint();
      const url = searchTerm 
        ? `${endpoint}?search=${encodeURIComponent(searchTerm)}`
        : endpoint;
      
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Received data:', result);
      
      if (result.success) {
        setItems(result.data);
      } else {
        setItems([]);
        console.warn('API returned success: false', result.message);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when page changes
  useEffect(() => {
    if (connectionStatus === 'connected' && isAuthenticated) {
      loadData();
    }
  }, [currentPage, connectionStatus, isAuthenticated]);

  // Search when search term changes (with debounce)
  useEffect(() => {
    if (connectionStatus !== 'connected' || !isAuthenticated) return;
    
    const debounceTimer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (connectionStatus !== 'connected' || !isAuthenticated) {
      setError('Not connected to backend or not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Prepare data for submission - handle empty fields
    const submissionData = { ...currentItem };
    
    // If time is empty string, set to null
    if (submissionData.time === '') {
      submissionData.time = null;
    }
    
    // If description is empty string, set to null
    if (submissionData.description === '') {
      submissionData.description = null;
    }
    
    try {
      const endpoint = getApiEndpoint();
      const url = isEditing ? `${endpoint}/${currentItem._id}` : endpoint;
      
      console.log('Submitting to:', url, submissionData);
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Submit result:', result);
      
      if (result.success) {
        setModalOpen(false);
        resetForm();
        loadData();
      } else {
        setError(result.message || 'Error saving item');
      }
    } catch (err) {
      setError(`Failed to save: ${err.message}`);
      console.error('Error saving item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem({
      ...item,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      time: item.time || '',
      description: item.description || ''
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto?')) return;
    
    if (connectionStatus !== 'connected' || !isAuthenticated) {
      setError('Not connected to backend or not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = getApiEndpoint();
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        loadData();
      } else {
        setError(result.message || 'Error deleting item');
      }
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const baseItem = {
      magaca: '',
      time: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    };

    if (currentPage === 'general-sales' || currentPage === 'daily-breakdown') {
      setCurrentItem({...baseItem, lacagta: ''});
    } else if (currentPage === 'customer-credit') {
      setCurrentItem({...baseItem, lacagta_uhartay: ''});
    } else if (currentPage === 'out-of-stock') {
      setCurrentItem({...baseItem, nooca: 'other'});
    }
    
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return '-';
    return timeValue;
  };

  const formatDescription = (desc) => {
    if (!desc) return '-';
    if (desc.length > 30) {
      return desc.substring(0, 30) + '...';
    }
    return desc;
  };

  const formatAdminName = (admin) => {
    if (!admin) return '-';
    return admin.fullName || admin.username || '-';
  };

  const getNoocaLabel = (nooca) => {
    const labels = {
      bur: 'Bur',
      sokor: 'Sokor',
      shampoo: 'Shampoo',
      other: 'Kuwo kale'
    };
    return labels[nooca] || nooca;
  };

  const renderTableHeaders = () => {
    switch(currentPage) {
      case 'general-sales':
      case 'daily-breakdown':
        return (
          <tr>
            <th>Magaca</th>
            <th>Waqtiga</th>
            <th>Taariikhda</th>
            <th>Lacagta</th>
            <th>Sharaxaad</th>
            <th>Sameeyay</th>
            <th>Wax ka badalay</th>
            <th>Actions</th>
          </tr>
        );
      case 'customer-credit':
        return (
          <tr>
            <th>Magaca</th>
            <th>Waqtiga</th>
            <th>Taariikhda</th>
            <th>Lacagta uhartay</th>
            <th>Sharaxaad</th>
            <th>Sameeyay</th>
            <th>Wax ka badalay</th>
            <th>Actions</th>
          </tr>
        );
      case 'out-of-stock':
        return (
          <tr>
            <th>Magaca</th>
            <th>Nooca</th>
            <th>Waqtiga</th>
            <th>Taariikhda</th>
            <th>Status</th>
            <th>Sharaxaad</th>
            <th>Sameeyay</th>
            <th>Wax ka badalay</th>
            <th>Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    if (!items || items.length === 0) return null;
    
    return items.map(item => {
      switch(currentPage) {
        case 'general-sales':
        case 'daily-breakdown':
          return (
            <tr key={item._id}>
              <td>{item.magaca}</td>
              <td>{formatTime(item.time)}</td>
              <td>{formatDate(item.date)}</td>
              <td>${item.lacagta}</td>
              <td className="description-cell" title={item.description || ''}>
                {formatDescription(item.description)}
              </td>
              <td className="admin-cell" title={formatAdminName(item.createdBy)}>
                👤 {formatAdminName(item.createdBy)}
              </td>
              <td className="admin-cell" title={formatAdminName(item.updatedBy)}>
                ✏️ {formatAdminName(item.updatedBy)}
              </td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(item)} disabled={loading}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(item._id)} disabled={loading}>🗑️</button>
              </td>
            </tr>
          );
        case 'customer-credit':
          return (
            <tr key={item._id}>
              <td>{item.magaca}</td>
              <td>{formatTime(item.time)}</td>
              <td>{formatDate(item.date)}</td>
              <td>${item.lacagta_uhartay}</td>
              <td className="description-cell" title={item.description || ''}>
                {formatDescription(item.description)}
              </td>
              <td className="admin-cell" title={formatAdminName(item.createdBy)}>
                👤 {formatAdminName(item.createdBy)}
              </td>
              <td className="admin-cell" title={formatAdminName(item.updatedBy)}>
                ✏️ {formatAdminName(item.updatedBy)}
              </td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(item)} disabled={loading}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(item._id)} disabled={loading}>🗑️</button>
              </td>
            </tr>
          );
        case 'out-of-stock':
          return (
            <tr key={item._id}>
              <td>{item.magaca}</td>
              <td>{getNoocaLabel(item.nooca)}</td>
              <td>{formatTime(item.time)}</td>
              <td>{formatDate(item.date)}</td>
              <td><span className="badge-danger">{item.qaangaadh}</span></td>
              <td className="description-cell" title={item.description || ''}>
                {formatDescription(item.description)}
              </td>
              <td className="admin-cell" title={formatAdminName(item.createdBy)}>
                👤 {formatAdminName(item.createdBy)}
              </td>
              <td className="admin-cell" title={formatAdminName(item.updatedBy)}>
                ✏️ {formatAdminName(item.updatedBy)}
              </td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(item)} disabled={loading}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(item._id)} disabled={loading}>🗑️</button>
              </td>
            </tr>
          );
        default:
          return null;
      }
    });
  };

  const renderForm = () => {
    // Common description field for all forms (optional)
    const descriptionField = (
      <div className="form-group">
        <label>Sharaxaad (Ikhtiyaar):</label>
        <textarea
          name="description"
          value={currentItem.description || ''}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="Sharaxaad ku saabsan (ikhtiyaar)"
          rows="3"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical' }}
        />
        <small style={{color: '#666', fontSize: '0.8rem'}}>
          📝 Sharaxaaddu waa ikhtiyaar, ka tag hadaadan rabin
        </small>
      </div>
    );

    switch(currentPage) {
      case 'general-sales':
      case 'daily-breakdown':
        return (
          <>
            <div className="form-group">
              <label>Magaca:</label>
              <input
                type="text"
                name="magaca"
                value={currentItem.magaca || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Magaca iibka"
              />
            </div>
            <div className="form-group">
              <label>Waqtiga (Ikhtiyaar):</label>
              <input
                type="time"
                name="time"
                value={currentItem.time || ''}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Waqtiga dooro (ikhtiyaar)"
              />
              <small style={{color: '#666', fontSize: '0.8rem'}}>
                ⏱️ Waqtigu waa ikhtiyaar, ka tag hadaadan rabin
              </small>
            </div>
            <div className="form-group">
              <label>Taariikhda:</label>
              <input
                type="date"
                name="date"
                value={currentItem.date || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Lacagta:</label>
              <input
                type="number"
                name="lacagta"
                value={currentItem.lacagta || ''}
                onChange={handleInputChange}
                min="0"
                required
                disabled={loading}
                placeholder="0.00"
              />
            </div>
            {descriptionField}
            
            {isEditing && (
              <div className="form-group" style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>
                <small>
                  <strong>Sameeyay:</strong> {formatAdminName(currentItem.createdBy)}<br/>
                  <strong>Wax ka badalay:</strong> {formatAdminName(currentItem.updatedBy)}<br/>
                  <strong>La sameeyay:</strong> {new Date(currentItem.createdAt).toLocaleString()}<br/>
                  <strong>La cusbooneysiiyay:</strong> {new Date(currentItem.updatedAt).toLocaleString()}
                </small>
              </div>
            )}
          </>
        );
      case 'customer-credit':
        return (
          <>
            <div className="form-group">
              <label>Magaca:</label>
              <input
                type="text"
                name="magaca"
                value={currentItem.magaca || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Magaca macmiilka"
              />
            </div>
            <div className="form-group">
              <label>Waqtiga (Ikhtiyaar):</label>
              <input
                type="time"
                name="time"
                value={currentItem.time || ''}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Waqtiga dooro (ikhtiyaar)"
              />
              <small style={{color: '#666', fontSize: '0.8rem'}}>
                ⏱️ Waqtigu waa ikhtiyaar, ka tag hadaadan rabin
              </small>
            </div>
            <div className="form-group">
              <label>Taariikhda:</label>
              <input
                type="date"
                name="date"
                value={currentItem.date || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Lacagta uhartay:</label>
              <input
                type="number"
                name="lacagta_uhartay"
                value={currentItem.lacagta_uhartay || ''}
                onChange={handleInputChange}
                min="0"
                required
                disabled={loading}
                placeholder="0.00"
              />
            </div>
            {descriptionField}
            
            {isEditing && (
              <div className="form-group" style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>
                <small>
                  <strong>Sameeyay:</strong> {formatAdminName(currentItem.createdBy)}<br/>
                  <strong>Wax ka badalay:</strong> {formatAdminName(currentItem.updatedBy)}<br/>
                  <strong>La sameeyay:</strong> {new Date(currentItem.createdAt).toLocaleString()}<br/>
                  <strong>La cusbooneysiiyay:</strong> {new Date(currentItem.updatedAt).toLocaleString()}
                </small>
              </div>
            )}
          </>
        );
      case 'out-of-stock':
        return (
          <>
            <div className="form-group">
              <label>Magaca:</label>
              <input
                type="text"
                name="magaca"
                value={currentItem.magaca || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Magaca alaabta"
              />
            </div>
            <div className="form-group">
              <label>Nooca:</label>
              <select
                name="nooca"
                value={currentItem.nooca || 'other'}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="bur">Bur</option>
                <option value="sokor">Sokor</option>
                <option value="shampoo">Shampoo</option>
                <option value="other">Kuwo kale</option>
              </select>
            </div>
            <div className="form-group">
              <label>Waqtiga (Ikhtiyaar):</label>
              <input
                type="time"
                name="time"
                value={currentItem.time || ''}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Waqtiga dooro (ikhtiyaar)"
              />
              <small style={{color: '#666', fontSize: '0.8rem'}}>
                ⏱️ Waqtigu waa ikhtiyaar, ka tag hadaadan rabin
              </small>
            </div>
            <div className="form-group">
              <label>Taariikhda:</label>
              <input
                type="date"
                name="date"
                value={currentItem.date || ''}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            {descriptionField}
            
            {isEditing && (
              <div className="form-group" style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>
                <small>
                  <strong>Sameeyay:</strong> {formatAdminName(currentItem.createdBy)}<br/>
                  <strong>Wax ka badalay:</strong> {formatAdminName(currentItem.updatedBy)}<br/>
                  <strong>La sameeyay:</strong> {new Date(currentItem.createdAt).toLocaleString()}<br/>
                  <strong>La cusbooneysiiyay:</strong> {new Date(currentItem.updatedAt).toLocaleString()}
                </small>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Retry connection
  const retryConnection = () => {
    setConnectionStatus('checking');
    setError(null);
    checkBackendConnection();
  };

  const currentInfo = pageInfo[currentPage];

  // If not authenticated, show auth modal
  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <h1>🏪 Maareynta iibka</h1>
              <p>{authMode === 'login' ? 'Soo gal' : 'Is diiwaangeli'}</p>
            </div>

            {error && (
              <div className="error-message" style={{marginBottom: '1rem'}}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <>
                  <div className="form-group">
                    <label>Magaca buuxa:</label>
                    <input
                      type="text"
                      name="fullName"
                      value={authForm.fullName}
                      onChange={handleAuthInputChange}
                      required
                      placeholder="Magacaaga buuxa"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthInputChange}
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={authForm.username}
                  onChange={handleAuthInputChange}
                  required
                  placeholder="Username"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  required
                  placeholder="••••••••"
                  minLength="6"
                />
                <small style={{color: '#666'}}>Ugu yaraan 6 xaraf</small>
              </div>

              <button 
                type="submit" 
                className="btn-save" 
                style={{width: '100%', marginTop: '1rem'}}
                disabled={loading}
              >
                {loading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Register')}
              </button>
            </form>

            <div style={{marginTop: '1rem', textAlign: 'center'}}>
              {authMode === 'login' ? (
                <p>
                  Aan lahayn akoon?{' '}
                  <button 
                    onClick={() => {
                      setAuthMode('register');
                      setError(null);
                    }}
                    style={{background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Horey akoon uga haystaa?{' '}
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setError(null);
                    }}
                    style={{background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline'}}
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">🏪 Maareynta iibka</div>
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'general-sales' ? 'active' : ''}`}
            onClick={() => setCurrentPage('general-sales')}
          >
            {pageInfo['general-sales'].icon} Deynta Caadiga Ah
          </button>
          <button 
            className={`nav-link ${currentPage === 'daily-breakdown' ? 'active' : ''}`}
            onClick={() => setCurrentPage('daily-breakdown')}
          >
            {pageInfo['daily-breakdown'].icon} Deynta Malinlaha
          </button>
          <button 
            className={`nav-link ${currentPage === 'customer-credit' ? 'active' : ''}`}
            onClick={() => setCurrentPage('customer-credit')}
          >
            {pageInfo['customer-credit'].icon} Lacag Macmiil Ku Hartay
          </button>
          <button 
            className={`nav-link ${currentPage === 'out-of-stock' ? 'active' : ''}`}
            onClick={() => setCurrentPage('out-of-stock')}
          >
            {pageInfo['out-of-stock'].icon} Maxaa Dhamaaday
          </button>
        </div>
        <div className="nav-user">
          <span style={{marginRight: '1rem', color: '#667eea'}}>
            👤 {admin?.fullName || admin?.username}
          </span>
          <button 
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Connection Status Indicator */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' ? '🟢 Connected to backend' : 
         connectionStatus === 'checking' ? '🟡 Checking connection...' : 
         '🔴 Disconnected'}
      </div>

      <div className="container">
        {/* Page Header with Description */}
        <div className="page-header" style={{
          background: `linear-gradient(135deg, ${currentInfo.color}20 0%, ${currentInfo.color}40 100%)`,
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: `1px solid ${currentInfo.color}30`
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
            <span style={{fontSize: '3rem'}}>{currentInfo.icon}</span>
            <div>
              <h1 style={{margin: 0, color: currentInfo.color}}>{currentInfo.title}</h1>
              <p style={{margin: '0.5rem 0 0 0', color: '#666', fontSize: '1.1rem'}}>
                {currentInfo.description}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <span style={{color: '#666', fontSize: '0.9rem'}}>Wadarta</span>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: currentInfo.color}}>
                {items.length}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <span style={{color: '#666', fontSize: '0.9rem'}}>{currentInfo.stats}</span>
            </div>
          </div>
        </div>

        <div className="header">
          <h2>
            {currentInfo.title}
          </h2>
          <button 
            className="btn-add" 
            onClick={() => { resetForm(); setModalOpen(true); }}
            disabled={loading || connectionStatus !== 'connected'}
          >
            + Ku dar cusub
          </button>
        </div>

        {/* Instructions Card */}
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #dee2e6'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{fontSize: '1.2rem'}}>ℹ️</span>
            <span style={{color: '#666'}}>{currentInfo.instructions}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Connection Instructions */}
        {connectionStatus !== 'connected' && (
          <div className="error-message" style={{background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba'}}>
            <div>
              <strong>⚠️ Backend not connected!</strong>
              <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
                Your backend is running but the frontend can't connect. This might be a CORS issue.
              </p>
              <button 
                onClick={retryConnection}
                style={{
                  background: '#856404',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        <div className="search-bar">
          <input
            type="text"
            placeholder="Raadi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={loading || connectionStatus !== 'connected'}
          />
          {searchTerm && (
            <button className="btn-clear" onClick={() => setSearchTerm('')} disabled={loading}>✕</button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>{renderTableHeaders()}</thead>
            <tbody>
              {items && items.length > 0 ? (
                renderTableRows()
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    {loading ? 'Loading...' : 
                     connectionStatus !== 'connected' ? 'Waiting for backend connection...' : 
                     'Waxba ma jiraan'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{isEditing ? 'Wax ka badal' : 'Ku dar cusub'}</h3>
              <button className="modal-close" onClick={() => { setModalOpen(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {renderForm()}
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
                </button>
                <button type="button" className="btn-cancel" onClick={() => { setModalOpen(false); resetForm(); }} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
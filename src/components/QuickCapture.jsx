import React, { useState, useEffect } from 'react';
import '../styles/quickcapture.css';

const QuickCapture = () => {
  const [captures, setCaptures] = useState([]);
  const [newCapture, setNewCapture] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  
  // Load captures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adhd_quest_captures');
    if (saved) {
      try {
        setCaptures(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading captures:', e);
      }
    }
  }, []);
  
  // Save captures to localStorage
  useEffect(() => {
    localStorage.setItem('adhd_quest_captures', JSON.stringify(captures));
  }, [captures]);
  
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  const handleAddCapture = () => {
    if (!newCapture.trim()) return;
    
    const capture = {
      id: generateId(),
      text: newCapture.trim(),
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(t => t) : [],
      createdAt: new Date().toISOString(),
      pinned: false
    };
    
    setCaptures(prev => [capture, ...prev]);
    setNewCapture('');
    setNewTags('');
  };
  
  const handleDeleteCapture = (id) => {
    if (window.confirm('Delete this capture?')) {
      setCaptures(prev => prev.filter(c => c.id !== id));
    }
  };
  
  const handleTogglePin = (id) => {
    setCaptures(prev => prev.map(c => 
      c.id === id ? { ...c, pinned: !c.pinned } : c
    ));
  };
  
  const handleClearAll = () => {
    if (window.confirm('Delete ALL captures? This cannot be undone!')) {
      setCaptures([]);
    }
  };
  
  // Get all unique tags
  const allTags = [...new Set(captures.flatMap(c => c.tags))];
  
  // Filter captures
  const filteredCaptures = captures.filter(capture => {
    const matchesSearch = capture.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capture.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag === 'all' || capture.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });
  
  // Sort: pinned first, then by date
  const sortedCaptures = [...filteredCaptures].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="quick-capture">
      <div className="capture-header">
        <h2>[ QUICK CAPTURE ]</h2>
        <p className="capture-subtitle">Brain Dump - Capture thoughts instantly</p>
      </div>
      
      {/* Input Section */}
      <div className="capture-input-section">
        <textarea
          value={newCapture}
          onChange={(e) => setNewCapture(e.target.value)}
          placeholder="Type your thought... (Press Ctrl+Enter to save)"
          className="capture-textarea"
          rows="4"
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              handleAddCapture();
            }
          }}
          autoFocus
        />
        
        <div className="capture-input-row">
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (comma separated): idea, urgent, work"
            className="capture-tags-input"
          />
          
          <button 
            onClick={handleAddCapture}
            disabled={!newCapture.trim()}
            className="capture-add-btn"
          >
            + CAPTURE
          </button>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="capture-filters">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search captures..."
          className="capture-search"
        />
        
        <div className="tag-filters">
          <button
            className={`tag-filter-btn ${filterTag === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTag('all')}
          >
            ALL ({captures.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter-btn ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(tag)}
            >
              #{tag} ({captures.filter(c => c.tags.includes(tag)).length})
            </button>
          ))}
        </div>
        
        {captures.length > 0 && (
          <button onClick={handleClearAll} className="clear-all-btn">
            🗑️ CLEAR ALL
          </button>
        )}
      </div>
      
      {/* Captures List */}
      <div className="captures-list">
        {sortedCaptures.length === 0 && (
          <div className="captures-empty">
            {captures.length === 0 ? (
              <>
                <p>📝 No captures yet</p>
                <p className="empty-subtitle">Start dumping your thoughts above!</p>
              </>
            ) : (
              <>
                <p>🔍 No matches found</p>
                <p className="empty-subtitle">Try a different search or tag</p>
              </>
            )}
          </div>
        )}
        
        {sortedCaptures.map(capture => (
          <div key={capture.id} className={`capture-card ${capture.pinned ? 'pinned' : ''}`}>
            <div className="capture-card-header">
              <span className="capture-date">{formatDate(capture.createdAt)}</span>
              <div className="capture-actions">
                <button
                  onClick={() => handleTogglePin(capture.id)}
                  className="capture-action-btn"
                  title={capture.pinned ? 'Unpin' : 'Pin'}
                >
                  {capture.pinned ? '📌' : '📍'}
                </button>
                <button
                  onClick={() => handleDeleteCapture(capture.id)}
                  className="capture-action-btn delete"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <p className="capture-text">{capture.text}</p>
            
            {capture.tags.length > 0 && (
              <div className="capture-tags">
                {capture.tags.map((tag, idx) => (
                  <span key={idx} className="capture-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Stats */}
      {captures.length > 0 && (
        <div className="capture-stats">
          <span>Total Captures: {captures.length}</span>
          <span>•</span>
          <span>Pinned: {captures.filter(c => c.pinned).length}</span>
          <span>•</span>
          <span>Tags: {allTags.length}</span>
        </div>
      )}
    </div>
  );
};

export default QuickCapture;

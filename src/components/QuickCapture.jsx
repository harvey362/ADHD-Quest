import React, { useState, useEffect, useRef } from 'react';
import '../styles/quickcapture.css';

const QuickCapture = () => {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'drawing'
  const [captures, setCaptures] = useState([]);
  const [newCapture, setNewCapture] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  // Drawing state
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00FF00');
  const [brushSize, setBrushSize] = useState(3);
  const [currentTool, setCurrentTool] = useState('pencil'); // 'pencil' or 'eraser'
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);

  // Track initial load to prevent saving empty arrays before loading from localStorage
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

    const savedDrawings = localStorage.getItem('adhd_quest_drawings');
    if (savedDrawings) {
      try {
        setDrawings(JSON.parse(savedDrawings));
      } catch (e) {
        console.error('Error loading drawings:', e);
      }
    }

    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Save captures to localStorage (skip on initial render)
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('adhd_quest_captures', JSON.stringify(captures));
    }
  }, [captures, isInitialLoad]);

  // Save drawings to localStorage (skip on initial render)
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('adhd_quest_drawings', JSON.stringify(drawings));
    }
  }, [drawings, isInitialLoad]);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvasContext) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setCanvasContext(ctx);
    }
  }, [canvasRef.current, activeTab]);
  
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

  // Drawing functions
  const startDrawing = (e) => {
    if (!canvasContext) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    canvasContext.beginPath();
    canvasContext.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasContext) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    canvasContext.strokeStyle = currentTool === 'eraser' ? '#000000' : currentColor;
    canvasContext.lineWidth = currentTool === 'eraser' ? brushSize * 3 : brushSize;
    canvasContext.lineTo(x, y);
    canvasContext.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasContext || !canvasRef.current) return;
    canvasContext.fillStyle = '#000000';
    canvasContext.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveDrawing = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const drawing = {
      id: generateId(),
      imageData: dataUrl,
      createdAt: new Date().toISOString()
    };
    setDrawings(prev => [drawing, ...prev]);
    clearCanvas();
    alert('Drawing saved!');
  };

  const deleteDrawing = (id) => {
    if (window.confirm('Delete this drawing?')) {
      setDrawings(prev => prev.filter(d => d.id !== id));
    }
  };

  const clearAllDrawings = () => {
    if (window.confirm('Delete ALL drawings? This cannot be undone!')) {
      setDrawings([]);
    }
  };
  
  return (
    <div className="quick-capture">
      <div className="capture-header">
        <h2>[ QUICK CAPTURE ]</h2>
        <p className="capture-subtitle">Brain Dump - Capture thoughts & sketches instantly</p>
      </div>

      {/* Tab Switcher */}
      <div className="capture-tabs">
        <button
          className={`capture-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          NOTES
        </button>
        <button
          className={`capture-tab ${activeTab === 'drawing' ? 'active' : ''}`}
          onClick={() => setActiveTab('drawing')}
        >
          DRAWING
        </button>
      </div>

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <>
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
        </>
      )}

      {/* DRAWING TAB */}
      {activeTab === 'drawing' && (
        <>
          <div className="drawing-section">
            {/* Drawing Controls */}
            <div className="drawing-controls">
              <div className="drawing-tools">
                <button
                  className={`tool-btn ${currentTool === 'pencil' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('pencil')}
                  title="Pencil"
                >
                  PENCIL
                </button>
                <button
                  className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
                  onClick={() => setCurrentTool('eraser')}
                  title="Eraser"
                >
                  ERASER
                </button>
              </div>

              <div className="drawing-colors">
                <span className="control-label">COLOR:</span>
                {['#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'].map(color => (
                  <button
                    key={color}
                    className={`color-btn ${currentColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                    title={color}
                  />
                ))}
              </div>

              <div className="drawing-brush-size">
                <span className="control-label">SIZE:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="brush-slider"
                />
                <span className="brush-size-display">{brushSize}px</span>
              </div>

              <div className="drawing-actions">
                <button onClick={clearCanvas} className="drawing-btn">
                  CLEAR
                </button>
                <button onClick={saveDrawing} className="drawing-btn save">
                  SAVE DRAWING
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="drawing-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ backgroundColor: '#000000', cursor: currentTool === 'eraser' ? 'crosshair' : 'default' }}
              />
            </div>

            {/* Saved Drawings */}
            {drawings.length > 0 && (
              <>
                <div className="drawings-header">
                  <h3>SAVED DRAWINGS ({drawings.length})</h3>
                  <button onClick={clearAllDrawings} className="clear-all-btn">
                    DELETE ALL
                  </button>
                </div>
                <div className="drawings-gallery">
                  {drawings.map(drawing => (
                    <div key={drawing.id} className="drawing-card">
                      <div className="drawing-card-header">
                        <span className="drawing-date">{formatDate(drawing.createdAt)}</span>
                        <button
                          onClick={() => deleteDrawing(drawing.id)}
                          className="drawing-delete-btn"
                          title="Delete"
                        >
                          X
                        </button>
                      </div>
                      <img
                        src={drawing.imageData}
                        alt="Saved drawing"
                        className="drawing-thumbnail"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickCapture;

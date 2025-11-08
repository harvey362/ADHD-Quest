/**
 * Template Library
 *
 * Allows users to save and reuse common task structures.
 * Templates include task title, subtasks, and tags.
 */

import React, { useState, useEffect } from 'react';
import '../styles/templatelibrary.css';

function TemplateLibrary({ onSelectTemplate, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    title: '',
    subtasks: [],
    tags: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('adhd_quest_templates') || '[]');
      setTemplates(saved);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  const saveTemplates = (updatedTemplates) => {
    try {
      localStorage.setItem('adhd_quest_templates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.title) {
      alert('Please provide a template name and task title');
      return;
    }

    const template = {
      id: Date.now().toString(),
      ...newTemplate,
      createdAt: new Date().toISOString(),
      useCount: 0,
    };

    const updatedTemplates = [...templates, template];
    saveTemplates(updatedTemplates);

    setNewTemplate({
      name: '',
      description: '',
      title: '',
      subtasks: [],
      tags: [],
    });
    setIsCreating(false);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      saveTemplates(updatedTemplates);
    }
  };

  const handleUseTemplate = (template) => {
    const updatedTemplates = templates.map(t =>
      t.id === template.id ? { ...t, useCount: (t.useCount || 0) + 1 } : t
    );
    saveTemplates(updatedTemplates);

    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleAddSubtask = () => {
    setNewTemplate({
      ...newTemplate,
      subtasks: [...newTemplate.subtasks, ''],
    });
  };

  const handleUpdateSubtask = (index, value) => {
    const updatedSubtasks = [...newTemplate.subtasks];
    updatedSubtasks[index] = value;
    setNewTemplate({
      ...newTemplate,
      subtasks: updatedSubtasks,
    });
  };

  const handleRemoveSubtask = (index) => {
    const updatedSubtasks = newTemplate.subtasks.filter((_, i) => i !== index);
    setNewTemplate({
      ...newTemplate,
      subtasks: updatedSubtasks,
    });
  };

  // Built-in templates
  const builtInTemplates = [
    {
      id: 'builtin-clean-room',
      name: 'Clean Room',
      description: 'Standard room cleaning checklist',
      title: 'Clean my room',
      subtasks: [
        'Stand up and walk to your room',
        'Pick up 3 items from the floor',
        'Put those items where they belong',
        'Make your bed - grab the sheets',
        'Pull sheets tight and tuck corners',
        'Fluff pillows and arrange them',
        'Grab dirty clothes',
        'Put clothes in hamper',
        'Clear desk surface',
        'Take out trash',
      ],
      isBuiltIn: true,
      useCount: 0,
    },
    {
      id: 'builtin-morning-routine',
      name: 'Morning Routine',
      description: 'Start your day right',
      title: 'Complete morning routine',
      subtasks: [
        'Get out of bed',
        'Walk to bathroom',
        'Brush teeth',
        'Wash face',
        'Get dressed',
        'Eat breakfast',
        'Take medication (if applicable)',
        'Review today\'s tasks',
      ],
      isBuiltIn: true,
      useCount: 0,
    },
    {
      id: 'builtin-study-session',
      name: 'Study Session',
      description: '25-minute focused study session',
      title: 'Study session',
      subtasks: [
        'Gather study materials',
        'Clear desk of distractions',
        'Set 25-minute timer',
        'Review notes for 5 minutes',
        'Practice problems for 15 minutes',
        'Summarize what you learned',
        'Take a 5-minute break',
      ],
      isBuiltIn: true,
      useCount: 0,
    },
  ];

  const allTemplates = [...builtInTemplates, ...templates];

  return (
    <div className="template-library">
      <div className="template-header">
        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
        <h1 className="template-title">📋 TEMPLATES</h1>
      </div>

      <div className="template-actions">
        <button
          className="create-template-button"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? '✖ CANCEL' : '+ NEW TEMPLATE'}
        </button>
      </div>

      {/* Create Template Form */}
      {isCreating && (
        <div className="template-form">
          <h2>Create New Template</h2>

          <div className="form-field">
            <label>Template Name</label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="e.g., Morning Routine"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <input
              type="text"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              placeholder="e.g., My daily morning tasks"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label>Task Title</label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              placeholder="e.g., Complete morning routine"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label>Subtasks</label>
            {newTemplate.subtasks.map((subtask, index) => (
              <div key={index} className="subtask-input-row">
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => handleUpdateSubtask(index, e.target.value)}
                  placeholder={`Subtask ${index + 1}`}
                  className="form-input"
                />
                <button
                  className="remove-subtask-button"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  ✖
                </button>
              </div>
            ))}
            <button className="add-subtask-button" onClick={handleAddSubtask}>
              + Add Subtask
            </button>
          </div>

          <div className="form-actions">
            <button className="save-template-button" onClick={handleCreateTemplate}>
              SAVE TEMPLATE
            </button>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="templates-grid">
        {allTemplates.map(template => (
          <div
            key={template.id}
            className={`template-card ${template.isBuiltIn ? 'builtin' : 'custom'}`}
          >
            <div className="template-card-header">
              <div className="template-name">
                {template.isBuiltIn && '⭐ '}
                {template.name}
              </div>
              {!template.isBuiltIn && (
                <button
                  className="delete-template-button"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  ✖
                </button>
              )}
            </div>

            <div className="template-description">
              {template.description}
            </div>

            <div className="template-details">
              <div className="detail-item">
                <span className="detail-label">Task:</span>
                <span className="detail-value">{template.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Subtasks:</span>
                <span className="detail-value">{template.subtasks?.length || 0}</span>
              </div>
              {template.useCount !== undefined && (
                <div className="detail-item">
                  <span className="detail-label">Used:</span>
                  <span className="detail-value">{template.useCount} times</span>
                </div>
              )}
            </div>

            <button
              className="use-template-button"
              onClick={() => handleUseTemplate(template)}
            >
              USE TEMPLATE
            </button>
          </div>
        ))}
      </div>

      {allTemplates.length === 0 && !isCreating && (
        <div className="no-templates">
          <p>No templates yet. Create your first template!</p>
        </div>
      )}
    </div>
  );
}

export default TemplateLibrary;

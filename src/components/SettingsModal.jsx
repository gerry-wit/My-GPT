import React, { useState, useEffect } from 'react';
import { X, Key, Trash2, AlertTriangle, Check } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, onClearChat, onApiKeyChange }) => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem('mygpt_api_key') || '';
            setApiKey(stored);
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('mygpt_api_key', apiKey.trim());
        } else {
            localStorage.removeItem('mygpt_api_key');
        }
        onApiKeyChange(apiKey.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all messages?')) {
            onClearChat();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="settings-overlay fade-in" onClick={onClose}>
            <div className="settings-panel slide-in-left" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="settings-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="settings-body">
                    <div className="settings-section">
                        <label className="settings-label">
                            <Key size={14} />
                            OpenRouter API Key
                        </label>
                        <p className="settings-desc">
                            Leave blank to use the server default key.
                        </p>
                        <input
                            type="password"
                            className="settings-input"
                            placeholder="sk-or-v1-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button className="settings-save-btn" onClick={handleSave}>
                            {saved ? (
                                <>
                                    <Check size={14} />
                                    Saved
                                </>
                            ) : (
                                'Save API Key'
                            )}
                        </button>
                    </div>

                    <div className="settings-divider" />

                    <div className="settings-section">
                        <label className="settings-label danger">
                            <AlertTriangle size={14} />
                            Danger Zone
                        </label>
                        <button className="settings-clear-btn" onClick={handleClear}>
                            <Trash2 size={14} />
                            Clear all chat history
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

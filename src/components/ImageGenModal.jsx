import React, { useState } from 'react';
import { X, Wand2, Loader2, Download, ImageIcon } from 'lucide-react';
import './ImageGenModal.css';
import { generateImage } from '../services/openrouter';

const ImageGenModal = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError('');
        setImageUrl(null);
        try {
            const url = await generateImage(prompt, 1024, 1024);
            setImageUrl(url);
        } catch (err) {
            setError('Failed to generate image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `mygpt-image-${Date.now()}.png`;
        link.target = '_blank';
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="img-overlay fade-in" onClick={onClose}>
            <div className="img-panel slide-in-left" onClick={(e) => e.stopPropagation()}>
                <div className="img-header">
                    <h2>
                        <Wand2 size={18} />
                        Image Generator
                    </h2>
                    <button className="img-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="img-body">
                    <textarea
                        className="img-prompt"
                        placeholder="Describe the image you want to generate..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="img-gen-btn"
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                    >
                        {loading ? (
                            <Loader2 size={16} className="spinner" />
                        ) : (
                            <ImageIcon size={16} />
                        )}
                        {loading ? 'Generating...' : 'Generate Image'}
                    </button>

                    {error && <p className="img-error">{error}</p>}

                    {imageUrl && (
                        <div className="img-result fade-in">
                            <img src={imageUrl} alt="Generated" loading="lazy" />
                            <button className="img-download" onClick={handleDownload}>
                                <Download size={14} />
                                Download
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGenModal;

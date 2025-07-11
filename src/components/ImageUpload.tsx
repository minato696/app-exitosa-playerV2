// src/components/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  type?: 'program' | 'station';
  className?: string;
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  type = 'program',
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Crear preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setPreviewUrl(result.data.url);
        onImageChange(result.data.url);
      } else {
        setError(result.error || 'Error al subir la imagen');
        setPreviewUrl(currentImage || null);
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setError('Error al subir la imagen');
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <style jsx>{`
        .image-upload-container {
          width: 100%;
        }

        .upload-area {
          position: relative;
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          background: #f9fafb;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .upload-area:hover {
          border-color: #1D498C;
          background: #f3f4f6;
        }

        .upload-area.has-image {
          padding: 0;
          border-style: solid;
        }

        .preview-container {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          overflow: hidden;
          border-radius: 6px;
        }

        .preview-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .preview-container:hover .preview-overlay {
          opacity: 1;
        }

        .remove-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-button:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .upload-icon {
          color: #6b7280;
        }

        .upload-text {
          color: #6b7280;
          font-size: 14px;
        }

        .upload-hint {
          color: #9ca3af;
          font-size: 12px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 10px;
        }

        input[type="file"] {
          display: none;
        }
      `}</style>

      <div 
        className={`upload-area ${previewUrl ? 'has-image' : ''}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="preview-container">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="preview-image"
            />
            <div className="preview-overlay">
              <span style={{ color: 'white' }}>Cambiar imagen</span>
            </div>
            <button 
              className="remove-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="upload-content">
            {isUploading ? (
              <Loader size={32} className="loading-spinner" />
            ) : (
              <Upload size={32} className="upload-icon" />
            )}
            <p className="upload-text">
              {isUploading ? 'Subiendo imagen...' : 'Haz clic para subir una imagen'}
            </p>
            <p className="upload-hint">
              JPG, PNG o WebP (máx. 5MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}

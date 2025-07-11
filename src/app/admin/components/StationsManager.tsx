// src/app/admin/components/StationsManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, Power, PowerOff, Search } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  url: string;
  city: string;
  region: string;
  description?: string;
  image?: string;
  active: boolean;
}

interface StationsManagerProps {
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function StationsManager({ showNotification }: StationsManagerProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stations');
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
      }
    } catch (error) {
      showNotification('error', 'Error al cargar las estaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (station: Station) => {
    try {
      const method = editingStation ? 'PUT' : 'POST';
      const response = await fetch('/api/stations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(station)
      });

      const result = await response.json();
      
      if (result.success) {
        showNotification('success', `Estación ${editingStation ? 'actualizada' : 'creada'} correctamente`);
        fetchStations();
        setEditingStation(null);
        setIsCreating(false);
      } else {
        showNotification('error', result.error || 'Error al guardar la estación');
      }
    } catch (error) {
      showNotification('error', 'Error al guardar la estación');
    }
  };

  const handleToggleActive = async (station: Station) => {
    try {
      const response = await fetch('/api/stations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...station, active: !station.active })
      });

      if (response.ok) {
        showNotification('success', `Estación ${!station.active ? 'activada' : 'desactivada'}`);
        fetchStations();
      }
    } catch (error) {
      showNotification('error', 'Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta estación? Se eliminarán también todos sus programas.')) {
      return;
    }

    try {
      const response = await fetch(`/api/stations?id=${id}&hard=true`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('success', 'Estación eliminada correctamente');
        fetchStations();
      }
    } catch (error) {
      showNotification('error', 'Error al eliminar la estación');
    }
  };

  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stations-manager">
      <style jsx>{`
        .stations-manager {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .manager-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .header-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-primary {
          background: #1D498C;
          color: white;
        }

        .btn-primary:hover {
          background: #2563B8;
        }

        .stations-grid {
          padding: 20px;
          display: grid;
          gap: 16px;
        }

        .station-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .station-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .station-info {
          flex: 1;
        }

        .station-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .station-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .station-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-active {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .station-details {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #6b7280;
        }

        .station-url {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #1D498C;
          text-decoration: none;
        }

        .station-url:hover {
          text-decoration: underline;
        }

        .station-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          transform: translateY(-1px);
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-edit:hover {
          background: #2563eb;
        }

        .btn-toggle {
          background: #f3f4f6;
          color: #6b7280;
        }

        .btn-toggle:hover {
          background: #e5e7eb;
        }

        .btn-toggle.active {
          background: #10b981;
          color: white;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .form-card {
          border: 2px solid #1D498C;
          background: #f9fafb;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-input:focus {
          outline: none;
          border-color: #1D498C;
          box-shadow: 0 0 0 3px rgba(29, 73, 140, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .search-box {
            width: 100%;
          }

          .station-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .station-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div className="manager-header">
        <h2 className="header-title">Gestión de Estaciones</h2>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} />
            Nueva Estación
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Cargando estaciones...</div>
      ) : (
        <div className="stations-grid">
          {isCreating && (
            <StationForm
              station={{
                id: '',
                name: '',
                url: '',
                city: '',
                region: '',
                description: '',
                active: true
              }}
              onSave={handleSave}
              onCancel={() => setIsCreating(false)}
              isNew={true}
            />
          )}

          {filteredStations.length === 0 && !isCreating ? (
            <div className="empty-state">
              {searchTerm ? 'No se encontraron estaciones' : 'No hay estaciones registradas'}
            </div>
          ) : (
            filteredStations.map(station => (
              <div key={station.id} className={`station-card ${editingStation?.id === station.id ? 'form-card' : ''}`}>
                {editingStation?.id === station.id ? (
                  <StationForm
                    station={station}
                    onSave={handleSave}
                    onCancel={() => setEditingStation(null)}
                    isNew={false}
                  />
                ) : (
                  <>
                    <div className="station-info">
                      <div className="station-header">
                        <h3 className="station-name">{station.name}</h3>
                        <span className={`station-badge ${station.active ? 'badge-active' : 'badge-inactive'}`}>
                          {station.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="station-details">
                        <span>{station.city}</span>
                        <a href={station.url} target="_blank" rel="noopener noreferrer" className="station-url">
                          Stream URL
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                    <div className="station-actions">
                      <button
                        className="icon-btn btn-edit"
                        onClick={() => setEditingStation(station)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={`icon-btn btn-toggle ${station.active ? 'active' : ''}`}
                        onClick={() => handleToggleActive(station)}
                        title={station.active ? 'Desactivar' : 'Activar'}
                      >
                        {station.active ? <Power size={16} /> : <PowerOff size={16} />}
                      </button>
                      <button
                        className="icon-btn btn-delete"
                        onClick={() => handleDelete(station.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface StationFormProps {
  station: Partial<Station>;
  onSave: (station: Station) => void;
  onCancel: () => void;
  isNew: boolean;
}

function StationForm({ station, onSave, onCancel, isNew }: StationFormProps) {
  const [formData, setFormData] = useState<Partial<Station>>(station);

  const handleSubmit = () => {
    if (!formData.id || !formData.name || !formData.url || !formData.city || !formData.region) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    onSave(formData as Station);
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">ID *</label>
          <input
            type="text"
            className="form-input"
            value={formData.id || ''}
            onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s/g, '') })}
            placeholder="lima, arequipa, etc."
            disabled={!isNew}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            className="form-input"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Exitosa Lima"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Ciudad *</label>
          <input
            type="text"
            className="form-input"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Lima"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Región *</label>
          <input
            type="text"
            className="form-input"
            value={formData.region || ''}
            onChange={(e) => setFormData({ ...formData, region: e.target.value.toLowerCase() })}
            placeholder="lima"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">URL del Stream *</label>
          <input
            type="url"
            className="form-input"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://streaming.example.com/stream"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Descripción</label>
          <input
            type="text"
            className="form-input"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="La radio más escuchada del Perú"
          />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn" onClick={onCancel}>
          <X size={16} />
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          <Save size={16} />
          Guardar
        </button>
      </div>
    </div>
  );
}
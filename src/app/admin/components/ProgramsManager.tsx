// src/app/admin/components/ProgramsManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Clock, User, Search, Filter, Upload, Image } from 'lucide-react';

interface Program {
  id?: number;
  station_id: string;
  station_name?: string;
  name: string;
  host: string;
  start_time: string;
  end_time: string;
  image?: string;
  description?: string;
  day_type: 'weekday' | 'saturday' | 'sunday';
  active?: boolean;
}

interface Station {
  id: string;
  name: string;
  active: boolean;
}

interface ProgramsManagerProps {
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const dayTypeLabels = {
  weekday: 'Lunes a Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

export default function ProgramsManager({ showNotification }: ProgramsManagerProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Filtros
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedDayType, setSelectedDayType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStations();
    fetchPrograms();
  }, [selectedStation, selectedDayType]);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations?active=true');
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
        if (!selectedStation && data.data.length > 0) {
          setSelectedStation(data.data[0].id);
        }
      }
    } catch (error) {
      showNotification('error', 'Error al cargar las estaciones');
    }
  };

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      let url = '/api/programs?';
      if (selectedStation) url += `stationId=${selectedStation}&`;
      if (selectedDayType) url += `dayType=${selectedDayType}&`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPrograms(data.data);
      }
    } catch (error) {
      showNotification('error', 'Error al cargar los programas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (program: Program) => {
    try {
      const method = program.id ? 'PUT' : 'POST';
      const response = await fetch('/api/programs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
      });

      const result = await response.json();
      
      if (result.success) {
        showNotification('success', `Programa ${program.id ? 'actualizado' : 'creado'} correctamente`);
        fetchPrograms();
        setEditingProgram(null);
        setIsCreating(false);
      } else {
        showNotification('error', result.error || 'Error al guardar el programa');
      }
    } catch (error) {
      showNotification('error', 'Error al guardar el programa');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este programa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/programs?id=${id}&hard=true`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('success', 'Programa eliminado correctamente');
        fetchPrograms();
      }
    } catch (error) {
      showNotification('error', 'Error al eliminar el programa');
    }
  };

  const filteredPrograms = programs.filter(program => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPrograms = filteredPrograms.reduce((acc, program) => {
    const key = program.day_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  return (
    <div className="programs-manager">
      <style jsx>{`
        .programs-manager {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .manager-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 16px;
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

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          min-width: 180px;
        }

        .programs-content {
          padding: 20px;
        }

        .day-section {
          margin-bottom: 32px;
        }

        .day-header {
          font-size: 18px;
          font-weight: 600;
          color: #1D498C;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .programs-grid {
          display: grid;
          gap: 12px;
        }

        .program-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
          transition: all 0.2s;
        }

        .program-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .program-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .program-info {
          flex: 1;
        }

        .program-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .program-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #1D498C;
          font-size: 14px;
          font-weight: 500;
        }

        .program-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .program-host {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 14px;
        }

        .program-description {
          color: #6b7280;
          font-size: 14px;
          margin-top: 4px;
        }

        .program-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
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

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-edit:hover {
          background: #2563eb;
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
          padding: 20px;
        }

        .form-grid {
          display: grid;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
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

        .form-input,
        .form-select,
        .form-textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #1D498C;
          box-shadow: 0 0 0 3px rgba(29, 73, 140, 0.1);
        }

        .form-section {
          margin-bottom: 20px;
        }

        .form-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
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

          .filters {
            width: 100%;
          }

          .filter-select {
            width: 100%;
          }

          .program-card {
            flex-direction: column;
            text-align: center;
          }

          .program-info {
            width: 100%;
          }

          .program-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="manager-header">
        <div className="header-top">
          <h2 className="header-title">Gestión de Programas</h2>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar programa o conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filtros
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={18} />
              Nuevo Programa
            </button>
          </div>
        </div>

        {(showFilters || true) && (
          <div className="filters">
            <select
              className="filter-select"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              <option value="">Todas las estaciones</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={selectedDayType}
              onChange={(e) => setSelectedDayType(e.target.value)}
            >
              <option value="">Todos los días</option>
              <option value="weekday">Lunes a Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading">Cargando programas...</div>
      ) : (
        <div className="programs-content">
          {isCreating && (
            <div className="form-card" style={{ marginBottom: '20px' }}>
              <ProgramForm
                program={{
                  station_id: selectedStation || stations[0]?.id || '',
                  name: '',
                  host: '',
                  start_time: '',
                  end_time: '',
                  day_type: 'weekday'
                }}
                stations={stations}
                onSave={handleSave}
                onCancel={() => setIsCreating(false)}
                showNotification={showNotification}
              />
            </div>
          )}

          {Object.keys(groupedPrograms).length === 0 && !isCreating ? (
            <div className="empty-state">
              {searchTerm ? 'No se encontraron programas' : 'No hay programas registrados'}
            </div>
          ) : (
            Object.entries(groupedPrograms).map(([dayType, dayPrograms]) => (
              <div key={dayType} className="day-section">
                <h3 className="day-header">{dayTypeLabels[dayType as keyof typeof dayTypeLabels]}</h3>
                <div className="programs-grid">
                  {dayPrograms.map(program => (
                    <div key={program.id} className={`program-card ${editingProgram?.id === program.id ? 'form-card' : ''}`}>
                      {editingProgram?.id === program.id ? (
                        <ProgramForm
                          program={program}
                          stations={stations}
                          onSave={handleSave}
                          onCancel={() => setEditingProgram(null)}
                          showNotification={showNotification}
                        />
                      ) : (
                        <>
                          {program.image ? (
                            <img src={program.image} alt={program.name} className="program-image" />
                          ) : (
                            <div className="program-image">
                              <Image size={32} />
                            </div>
                          )}
                          <div className="program-info">
                            <div className="program-header">
                              <div className="program-time">
                                <Clock size={16} />
                                {program.start_time} - {program.end_time}
                              </div>
                            </div>
                            <h4 className="program-name">{program.name}</h4>
                            <div className="program-host">
                              <User size={14} />
                              {program.host}
                            </div>
                            {program.description && (
                              <p className="program-description">{program.description}</p>
                            )}
                          </div>
                          <div className="program-actions">
                            <button
                              className="icon-btn btn-edit"
                              onClick={() => setEditingProgram(program)}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="icon-btn btn-delete"
                              onClick={() => handleDelete(program.id!)}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ProgramFormProps {
  program: Partial<Program>;
  stations: Station[];
  onSave: (program: Program) => void;
  onCancel: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

function ProgramForm({ program, stations, onSave, onCancel, showNotification }: ProgramFormProps) {
  const [formData, setFormData] = useState<Partial<Program>>(program);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'program');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const result = await response.json();
      
      if (result.success) {
        setFormData({ ...formData, image: result.data.url });
        showNotification('success', 'Imagen subida correctamente');
      } else {
        showNotification('error', 'Error al subir la imagen');
      }
    } catch (error) {
      showNotification('error', 'Error al subir la imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.station_id || !formData.name || !formData.host || 
        !formData.start_time || !formData.end_time || !formData.day_type) {
      showNotification('error', 'Por favor complete todos los campos requeridos');
      return;
    }
    onSave(formData as Program);
  };

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3 className="form-section-title">Información del Programa</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Estación *</label>
            <select
              className="form-select"
              value={formData.station_id || ''}
              onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
            >
              <option value="">Seleccione una estación</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Día *</label>
            <select
              className="form-select"
              value={formData.day_type || ''}
              onChange={(e) => setFormData({ ...formData, day_type: e.target.value as any })}
            >
              <option value="">Seleccione tipo de día</option>
              <option value="weekday">Lunes a Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hora de Inicio *</label>
            <input
              type="time"
              className="form-input"
              value={formData.start_time || ''}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Hora de Fin *</label>
            <input
              type="time"
              className="form-input"
              value={formData.end_time || ''}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nombre del Programa *</label>
          <input
            type="text"
            className="form-input"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Hablemos Claro"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Conductor(es) *</label>
          <input
            type="text"
            className="form-input"
            value={formData.host || ''}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            placeholder="Ej: Nicolás Lúcar"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-textarea"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción del programa (opcional)"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Imagen del Programa</h3>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            style={{ display: 'none' }}
            id="image-upload"
            disabled={isUploadingImage}
          />
          <label htmlFor="image-upload">
            <div className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <Upload size={16} />
              {isUploadingImage ? 'Subiendo...' : 'Subir Imagen'}
            </div>
          </label>
        </div>
        {formData.image && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={formData.image} 
              alt="Preview" 
              style={{ 
                width: '200px', 
                height: '150px', 
                objectFit: 'cover', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }} 
            />
            <button
              className="icon-btn btn-delete"
              style={{ position: 'absolute', top: '8px', right: '8px' }}
              onClick={() => setFormData({ ...formData, image: undefined })}
              title="Eliminar imagen"
            >
              <X size={16} />
            </button>
          </div>
        )}
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
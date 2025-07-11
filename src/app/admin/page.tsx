// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radio, Calendar, Settings, Database, Plus, Edit2, Trash2, 
  Save, X, Power, PowerOff, Search, Filter, Upload, Clock, 
  User, ChevronLeft, ChevronRight, ExternalLink 
} from 'lucide-react';

interface Station {
  id: string;
  name: string;
  url: string;
  city: string;
  region: string;
  description?: string;
  image?: string;
  active: number;
}

interface Program {
  id?: number;
  station_id: string;
  name: string;
  host: string;
  start_time: string;
  end_time: string;
  image?: string;
  description?: string;
  day_type: 'weekday' | 'saturday' | 'sunday';
  active?: number;
}

type TabType = 'stations' | 'programs' | 'settings';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('stations');
  const [stations, setStations] = useState<Station[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedDayType, setSelectedDayType] = useState<string>('weekday');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // Estados para edición
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isCreatingStation, setIsCreatingStation] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      fetchPrograms();
    }
  }, [selectedStation, selectedDayType]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stations');
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
        if (data.data.length > 0 && !selectedStation) {
          setSelectedStation(data.data[0].id);
        }
      }
    } catch (error) {
      showNotification('error', 'Error al cargar estaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const url = `/api/programs?stationId=${selectedStation}&dayType=${selectedDayType}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPrograms(data.data);
      }
    } catch (error) {
      showNotification('error', 'Error al cargar programas');
    } finally {
      setIsLoading(false);
    }
  };

  const saveStation = async (station: Station) => {
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
        setIsCreatingStation(false);
      } else {
        showNotification('error', result.error || 'Error al guardar');
      }
    } catch (error) {
      showNotification('error', 'Error al guardar estación');
    }
  };

  const toggleStationActive = async (station: Station) => {
    try {
      const response = await fetch('/api/stations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...station, active: station.active ? 0 : 1 })
      });

      if (response.ok) {
        showNotification('success', `Estación ${station.active ? 'desactivada' : 'activada'}`);
        fetchStations();
      }
    } catch (error) {
      showNotification('error', 'Error al cambiar estado');
    }
  };

  const deleteStation = async (id: string) => {
    if (!confirm('¿Eliminar esta estación? Se eliminarán también todos sus programas.')) {
      return;
    }

    try {
      const response = await fetch(`/api/stations?id=${id}&hard=true`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('success', 'Estación eliminada');
        fetchStations();
      }
    } catch (error) {
      showNotification('error', 'Error al eliminar');
    }
  };

  const saveProgram = async (program: Program) => {
    try {
      const method = program.id ? 'PUT' : 'POST';
      const response = await fetch('/api/programs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
      });

      const result = await response.json();
      
      if (result.success) {
        showNotification('success', `Programa ${program.id ? 'actualizado' : 'creado'}`);
        fetchPrograms();
        setEditingProgram(null);
        setIsCreatingProgram(false);
      }
    } catch (error) {
      showNotification('error', 'Error al guardar programa');
    }
  };

  const deleteProgram = async (id: number) => {
    if (!confirm('¿Eliminar este programa?')) return;

    try {
      const response = await fetch(`/api/programs?id=${id}&hard=true`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('success', 'Programa eliminado');
        fetchPrograms();
      }
    } catch (error) {
      showNotification('error', 'Error al eliminar');
    }
  };

  const handleImageUpload = async (file: File, type: 'station' | 'program') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        return result.data.url;
      }
    } catch (error) {
      showNotification('error', 'Error al subir imagen');
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: '#D70007', color: 'white', padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0 }}>
            Panel de Administración - Radio Exitosa
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex' }}>
          <button
            onClick={() => setActiveTab('stations')}
            style={{
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'stations' ? '3px solid #D70007' : 'none',
              color: activeTab === 'stations' ? '#D70007' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Radio size={20} />
            Estaciones
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            style={{
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'programs' ? '3px solid #D70007' : 'none',
              color: activeTab === 'programs' ? '#D70007' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calendar size={20} />
            Programas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '16px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'settings' ? '3px solid #D70007' : 'none',
              color: activeTab === 'settings' ? '#D70007' : '#6b7280',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Settings size={20} />
            Configuración
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Tab Estaciones */}
        {activeTab === 'stations' && (
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Gestión de Estaciones</h2>
              <button
                onClick={() => setIsCreatingStation(true)}
                style={{
                  padding: '8px 16px',
                  background: '#D70007',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={18} />
                Nueva Estación
              </button>
            </div>

            {isCreatingStation && (
              <StationForm
                station={{ id: '', name: '', url: '', city: '', region: '', active: 1 }}
                onSave={saveStation}
                onCancel={() => setIsCreatingStation(false)}
                onImageUpload={handleImageUpload}
              />
            )}

            <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
              {stations.map(station => (
                <div key={station.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {editingStation?.id === station.id ? (
                    <StationForm
                      station={station}
                      onSave={saveStation}
                      onCancel={() => setEditingStation(null)}
                      onImageUpload={handleImageUpload}
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{station.name}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>{station.city}</p>
                        <a href={station.url} target="_blank" style={{ 
                          color: '#D70007', 
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '4px'
                        }}>
                          URL del Stream <ExternalLink size={14} />
                        </a>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingStation(station)}
                          style={{
                            padding: '8px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleStationActive(station)}
                          style={{
                            padding: '8px',
                            background: station.active ? '#10b981' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {station.active ? <Power size={16} /> : <PowerOff size={16} />}
                        </button>
                        <button
                          onClick={() => deleteStation(station.id)}
                          style={{
                            padding: '8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Programas */}
        {activeTab === 'programs' && (
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Gestión de Programas</h2>
              <button
                onClick={() => setIsCreatingProgram(true)}
                style={{
                  padding: '8px 16px',
                  background: '#D70007',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={18} />
                Nuevo Programa
              </button>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white'
                }}
              >
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDayType}
                onChange={(e) => setSelectedDayType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white'
                }}
              >
                <option value="weekday">Lunes a Viernes</option>
                <option value="saturday">Sábado</option>
                <option value="sunday">Domingo</option>
              </select>
            </div>

            {isCreatingProgram && (
              <ProgramForm
                program={{
                  station_id: selectedStation,
                  name: '',
                  host: '',
                  start_time: '',
                  end_time: '',
                  day_type: selectedDayType as any
                }}
                onSave={saveProgram}
                onCancel={() => setIsCreatingProgram(false)}
                onImageUpload={handleImageUpload}
              />
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {programs.map(program => (
                <div key={program.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {editingProgram?.id === program.id ? (
                    <ProgramForm
                      program={program}
                      onSave={saveProgram}
                      onCancel={() => setEditingProgram(null)}
                      onImageUpload={handleImageUpload}
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {program.image && (
                          <img 
                            src={program.image} 
                            alt={program.name}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{program.name}</h3>
                          <p style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} />
                            {program.start_time} - {program.end_time}
                          </p>
                          <p style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={14} />
                            {program.host}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingProgram(program)}
                          style={{
                            padding: '8px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteProgram(program.id!)}
                          style={{
                            padding: '8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Configuración */}
        {activeTab === 'settings' && (
          <div style={{ background: 'white', borderRadius: '8px', padding: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '30px' }}>Configuración del Sistema</h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <button
                onClick={async () => {
                  const res = await fetch('/api/init');
                  const data = await res.json();
                  showNotification(data.success ? 'success' : 'error', data.message);
                }}
                style={{
                  padding: '15px',
                  background: '#D70007',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Database size={20} />
                Inicializar Base de Datos
              </button>

              <button
                onClick={async () => {
                  const res = await fetch('/api/load-schedule?all=true', { method: 'POST' });
                  const data = await res.json();
                  showNotification(data.success ? 'success' : 'info', 'Programación cargada');
                }}
                style={{
                  padding: '15px',
                  background: '#094293',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cargar Programación Completa
              </button>

              <a
                href="/"
                style={{
                  padding: '15px',
                  background: '#6b7280',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                ← Volver al Reproductor
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Notificaciones */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          background: notification.type === 'success' ? '#10b981' : 
                      notification.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

// Componente para formulario de estación
function StationForm({ station, onSave, onCancel, onImageUpload }: {
  station: Partial<Station>,
  onSave: (station: Station) => void,
  onCancel: () => void,
  onImageUpload: (file: File, type: 'station' | 'program') => Promise<string | null>
}) {
  const [formData, setFormData] = useState<Partial<Station>>(station);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = () => {
    if (!formData.id || !formData.name || !formData.url || !formData.city || !formData.region) {
      alert('Complete todos los campos requeridos');
      return;
    }
    onSave(formData as Station);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const url = await onImageUpload(file, 'station');
      if (url) {
        setFormData({ ...formData, image: url });
      }
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      background: '#f9fafb', 
      padding: '20px', 
      borderRadius: '8px',
      border: '2px solid #D70007',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>ID *</label>
            <input
              type="text"
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
              disabled={!!station.id}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>URL del Stream *</label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://streaming-url..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Ciudad *</label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Región *</label>
            <input
              type="text"
              value={formData.region || ''}
              onChange={(e) => setFormData({ ...formData, region: e.target.value.toLowerCase() })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
          {formData.image && (
            <img 
              src={formData.image} 
              alt="Preview" 
              style={{ marginTop: '8px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: '#D70007',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Save size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para formulario de programa
function ProgramForm({ program, onSave, onCancel, onImageUpload }: {
  program: Partial<Program>,
  onSave: (program: Program) => void,
  onCancel: () => void,
  onImageUpload: (file: File, type: 'station' | 'program') => Promise<string | null>
}) {
  const [formData, setFormData] = useState<Partial<Program>>(program);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = () => {
    if (!formData.name || !formData.host || !formData.start_time || !formData.end_time) {
      alert('Complete todos los campos requeridos');
      return;
    }
    onSave(formData as Program);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const url = await onImageUpload(file, 'program');
      if (url) {
        setFormData({ ...formData, image: url });
      }
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      background: '#f9fafb', 
      padding: '20px', 
      borderRadius: '8px',
      border: '2px solid #D70007',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Nombre del Programa *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Conductor(es) *</label>
          <input
            type="text"
            value={formData.host || ''}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Hora Inicio *</label>
            <input
              type="time"
              value={formData.start_time || ''}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Hora Fin *</label>
            <input
              type="time"
              value={formData.end_time || ''}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Imagen del Programa</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
          {formData.image && (
            <img 
              src={formData.image} 
              alt="Preview" 
              style={{ marginTop: '8px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: '#D70007',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Save size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
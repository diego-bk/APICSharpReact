import React, { useEffect, useState } from 'react';
import { getCitas, getCita, createCita, updateCita, deleteCita } from './services/citas';
import { getMascotas } from './services/mascotas';
import { getVeterinarios } from './services/veterinarios';
import './CitasPage.css';

type Cita = {
  citaId?: number;
  mascotaId?: number;
  veterinarioId?: number;
  fechaHora?: string;
  estado?: string;
  mascota?: {
    mascotaId: number;
    nombre: string;
    cliente?: {
      nombreCompleto: string;
    };
  };
  veterinario?: {
    veterinarioId: number;
    nombreCompleto: string;
  };
};

type Mascota = {
  mascotaId?: number;
  nombre?: string;
  cliente?: {
    nombreCompleto?: string;
  };
};

type Veterinario = {
  veterinarioId?: number;
  nombreCompleto?: string;
};

const CitasPage: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new'|'edit'>('new');
  const [modalForm, setModalForm] = useState<Cita>({});

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const citasData = await getCitas();
      setCitas(citasData || []);
      
      // Cargar mascotas y veterinarios para los selects
      const mascotasData = await getMascotas();
      setMascotas(mascotasData || []);
      
      const veterinariosData = await getVeterinarios();
      setVeterinarios(veterinariosData || []);
    } catch (e: any) { 
      setError(e.message || 'Error'); 
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { 
    setModalMode('new'); 
    setModalForm({
      estado: 'Programada' // Estado por defecto
    }); 
    setShowModal(true); 
  };

  const openEdit = async (id?: number) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const data: any = await getCita(id);
      
      // Formatear la fecha para el input datetime-local
      let fechaHoraFormatted = '';
      const fechaHora = data.FechaHora ?? data.fechaHora;
      if (fechaHora) {
        const date = new Date(fechaHora);
        // Formatear para datetime-local input (YYYY-MM-DDTHH:MM)
        fechaHoraFormatted = date.toISOString().slice(0, 16);
      }
      
      // normalize server response to frontend-friendly keys
      const mapped: any = {
        citaId: data.citaId ?? data.CitaId ?? undefined,
        mascotaId: data.MascotaId ?? data.mascotaId ?? undefined,
        veterinarioId: data.VeterinarioId ?? data.veterinarioId ?? undefined,
        fechaHora: fechaHoraFormatted,
        estado: data.Estado ?? data.estado ?? '',
      };
      setModalForm(mapped);
      setModalMode('edit');
      setShowModal(true);
    } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  const saveModal = async () => {
    setLoading(true); setError('');
    
    // Validaciones básicas
    if (!modalForm.mascotaId) {
      setError('Debe seleccionar una mascota');
      setLoading(false);
      return;
    }
    
    if (!modalForm.veterinarioId) {
      setError('Debe seleccionar un veterinario');
      setLoading(false);
      return;
    }
    
    if (!modalForm.fechaHora) {
      setError('Debe seleccionar fecha y hora');
      setLoading(false);
      return;
    }
    
    try {
      // Formatear la fecha para el backend
      const fechaISO = new Date(modalForm.fechaHora).toISOString();
      
      // map frontend form fields to backend DTO
      const payload: any = {
        MascotaId: modalForm.mascotaId,
        VeterinarioId: modalForm.veterinarioId,
        FechaHora: fechaISO,
        Estado: modalForm.estado || 'Programada',
      };

      // Solo agregar CitaId si estamos editando
      if (modalMode === 'edit' && modalForm.citaId) {
        payload.CitaId = modalForm.citaId;
        await updateCita(modalForm.citaId, payload);
      } else {
        await createCita(payload);
      }
      setShowModal(false);
      await load();
    } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  const openDelete = (id?: number) => {
    if (!id) return;
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true); setError('');
    try { await deleteCita(deleteId); await load(); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteId(undefined);
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTime;
    }
  };

  return (
    <div className="citas-page table-mode">
      <div className="citas-header">
        <h2>Citas</h2>
        <div className="citas-header-actions">
          <button className="btn-primary" onClick={openNew}>Nueva Cita</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="citas-table-wrap">
        <table className="citas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mascota</th>
              <th>Cliente</th>
              <th>Veterinario</th>
              <th>Fecha y Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map(c => (
              <tr key={c.citaId}>
                <td>{c.citaId}</td>
                <td>{(c.mascota as any)?.Nombre || (c.mascota as any)?.nombre}</td>
                <td>{(c.mascota as any)?.Cliente?.NombreCompleto || (c.mascota as any)?.cliente?.nombreCompleto}</td>
                <td>{(c.veterinario as any)?.NombreCompleto || (c.veterinario as any)?.nombreCompleto}</td>
                <td>{formatDateTime((c as any).FechaHora || c.fechaHora || '')}</td>
                <td>
                  <span className={`estado-badge estado-${((c as any).Estado || c.estado || '').toLowerCase()}`}>
                    {(c as any).Estado || c.estado}
                  </span>
                </td>
                <td>
                  <button onClick={() => openEdit(c.citaId)}>Editar</button>
                  <button className="btn-danger" onClick={() => openDelete(c.citaId)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === 'edit' ? 'Editar Cita' : 'Nueva Cita'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Mascota</label>
              <select
                value={modalForm.mascotaId || ''}
                onChange={e => setModalForm({...modalForm, mascotaId: e.target.value ? parseInt(e.target.value) : undefined})}
                title="Seleccionar Mascota"
              >
                <option value="">-- Seleccionar mascota --</option>
                {mascotas.map(mascota => (
                  <option key={mascota.mascotaId} value={mascota.mascotaId}>
                    {(mascota as any).Nombre || mascota.nombre} - {(mascota as any).Cliente?.NombreCompleto || (mascota as any).cliente?.nombreCompleto}
                  </option>
                ))}
              </select>
              
              <label>Veterinario</label>
              <select
                value={modalForm.veterinarioId || ''}
                onChange={e => setModalForm({...modalForm, veterinarioId: e.target.value ? parseInt(e.target.value) : undefined})}
                title="Seleccionar Veterinario"
              >
                <option value="">-- Seleccionar veterinario --</option>
                {veterinarios.map(vet => (
                  <option key={vet.veterinarioId} value={vet.veterinarioId}>
                    {(vet as any).NombreCompleto || vet.nombreCompleto}
                  </option>
                ))}
              </select>

              <label>Fecha y Hora</label>
              <input 
                type="datetime-local"
                value={modalForm.fechaHora || ''} 
                onChange={e => setModalForm({...modalForm, fechaHora: e.target.value})} 
                title="Fecha y Hora" 
              />
              
              <label>Estado</label>
              <select
                value={modalForm.estado || 'Programada'}
                onChange={e => setModalForm({...modalForm, estado: e.target.value})}
                title="Estado de la cita"
              >
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="En curso">En curso</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveModal} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="delete-modal-overlay" role="dialog" aria-modal="true">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Confirmar Eliminación</h3>
            </div>
            <div className="delete-modal-body">
              <p>¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={() => { setShowDeleteModal(false); setDeleteId(undefined); }}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={loading}>{loading ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasPage;

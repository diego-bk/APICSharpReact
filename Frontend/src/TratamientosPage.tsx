import React, { useEffect, useState } from 'react';
import { getTratamientos, getTratamiento, createTratamiento, updateTratamiento, deleteTratamiento } from './services/tratamientos';
import { getCitas } from './services/citas';
import './TratamientosPage.css';

type Tratamiento = {
  tratamientoId?: number;
  descripcion?: string;
  costo?: number;
  notas?: string;
  citaId?: number;
  cita?: {
    citaId: number;
    fechaHora: string;
    estado: string;
    mascota?: {
      nombre: string;
      cliente?: {
        nombreCompleto: string;
      };
    };
  };
}

type Cita = {
  citaId?: number;
  fechaHora?: string;
  estado?: string;
  mascota?: {
    nombre?: string;
    cliente?: {
      nombreCompleto?: string;
    };
  };
  veterinario?: {
    nombreCompleto?: string;
  };
};

const TratamientosPage: React.FC = () => {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new'|'edit'>('new');
  const [modalForm, setModalForm] = useState<Tratamiento>({});

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const load = async () => {
    setLoading(true); setError('');
    try { 
      const data = await getTratamientos(); 
      setTratamientos(data || []); 
      
      // Cargar citas para el select
      const citasData = await getCitas();
      setCitas(citasData || []);
    } catch (e: any) { 
      setError(e.message || 'Error'); 
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setModalMode('new'); setModalForm({}); setShowModal(true); };

  const openEdit = async (id?: number) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const data: any = await getTratamiento(id);
      // normalize server response to frontend-friendly keys
      const mapped: any = {
        tratamientoId: data.tratamientoId ?? data.TratamientoId ?? undefined,
        descripcion: data.Descripcion ?? data.descripcion ?? '',
        costo: data.Costo ?? data.costo ?? 0,
        notas: data.Notas ?? data.notas ?? '',
        citaId: data.CitaId ?? data.citaId ?? undefined,
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
    if (!modalForm.citaId) {
      setError('Debe seleccionar una cita');
      setLoading(false);
      return;
    }
    
    if (!modalForm.descripcion?.trim()) {
      setError('La descripción es obligatoria');
      setLoading(false);
      return;
    }
    
    try {
      // map frontend form fields to backend DTO
      const payload: any = {
        CitaId: modalForm.citaId,
        Descripcion: modalForm.descripcion.trim(),
        Costo: modalForm.costo || 0,
        Notas: modalForm.notas?.trim() || null,
      };

      // Solo agregar TratamientoId si estamos editando
      if (modalMode === 'edit' && modalForm.tratamientoId) {
        payload.TratamientoId = modalForm.tratamientoId;
        await updateTratamiento(modalForm.tratamientoId, payload);
      } else {
        await createTratamiento(payload);
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
    try { await deleteTratamiento(deleteId); await load(); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteId(undefined);
  };

  return (
    <div className="tratamientos-page table-mode">
      <div className="tratamientos-header">
        <h2>Tratamientos</h2>
        <div className="tratamientos-header-actions">
          <button className="btn-primary" onClick={openNew}>Nuevo</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="tratamientos-table-wrap">
        <table className="tratamientos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Notas</th>
              <th>Cita</th>
              <th>Mascota</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tratamientos.map(t => (
              <tr key={t.tratamientoId}>
                <td>{t.tratamientoId}</td>
                <td>{t.descripcion}</td>
                <td>${t.costo?.toFixed(2) || '0.00'}</td>
                <td>{t.notas}</td>
                <td>#{t.citaId}</td>
                <td>{(t.cita as any)?.Mascota?.Nombre || (t.cita as any)?.mascota?.nombre || 'N/A'}</td>
                <td>{(t.cita as any)?.Mascota?.Cliente?.NombreCompleto || (t.cita as any)?.mascota?.cliente?.nombreCompleto || 'N/A'}</td>
                <td>
                  <button onClick={() => openEdit(t.tratamientoId)}>Editar</button>
                  <button className="btn-danger" onClick={() => openDelete(t.tratamientoId)}>Eliminar</button>
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
              <h3>{modalMode === 'edit' ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Descripción</label>
              <input value={modalForm.descripcion || ''} onChange={e => setModalForm({...modalForm, descripcion: e.target.value})} placeholder="Descripción" title="Descripción" />
              <label>Costo</label>
              <input type="number" step="0.01" value={modalForm.costo || ''} onChange={e => setModalForm({...modalForm, costo: parseFloat(e.target.value) || 0})} placeholder="Costo" title="Costo" />
              <label>Notas</label>
              <input value={modalForm.notas || ''} onChange={e => setModalForm({...modalForm, notas: e.target.value})} placeholder="Notas" title="Notas" />
              <label>Cita</label>
              <select
                value={modalForm.citaId || ''}
                onChange={e => setModalForm({...modalForm, citaId: e.target.value ? parseInt(e.target.value) : undefined})}
                title="Seleccionar Cita"
              >
                <option value="">-- Seleccionar cita --</option>
                {citas.map(cita => {
                  const fecha = cita.fechaHora ? new Date(cita.fechaHora).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '';
                  const mascota = (cita as any).Mascota?.Nombre || (cita as any).mascota?.nombre || 'Sin mascota';
                  const cliente = (cita as any).Mascota?.Cliente?.NombreCompleto || (cita as any).mascota?.cliente?.nombreCompleto || 'Sin cliente';
                  
                  return (
                    <option key={cita.citaId} value={cita.citaId}>
                      #{cita.citaId} - {mascota} ({cliente}) - {fecha}
                    </option>
                  );
                })}
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
              <p>¿Estás seguro de que deseas eliminar este tratamiento? Esta acción no se puede deshacer.</p>
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

export default TratamientosPage;

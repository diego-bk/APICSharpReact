import React, { useEffect, useState } from 'react';
import { getVeterinarios, getVeterinario, createVeterinario, updateVeterinario, deleteVeterinario } from './services/veterinarios';
import './VeterinariosPage.css';

type Veterinario = {
  veterinarioId?: number;
  nombreCompleto?: string;
  telefono?: string;
  email?: string;
  especialidad?: string;
}

const VeterinariosPage: React.FC = () => {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new'|'edit'>('new');
  const [modalForm, setModalForm] = useState<Veterinario>({});

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const load = async () => {
    setLoading(true); setError('');
    try { const data = await getVeterinarios(); setVeterinarios(data || []); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setModalMode('new'); setModalForm({}); setShowModal(true); };

  const openEdit = async (id?: number) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const data: any = await getVeterinario(id);
      // normalize server response to frontend-friendly keys
      const mapped: any = {
        veterinarioId: data.veterinarioId ?? data.VeterinarioId ?? undefined,
        nombreCompleto: data.NombreCompleto ?? data.nombreCompleto ?? '',
        telefono: data.Telefono ?? data.telefono ?? '',
        email: data.Email ?? data.email ?? '',
        especialidad: data.Especialidad ?? data.especialidad ?? '',
      };
      setModalForm(mapped);
      setModalMode('edit');
      setShowModal(true);
    } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  const saveModal = async () => {
    setLoading(true); setError('');
    try {
      // map frontend form fields to backend model property names
      const payload: any = {
        VeterinarioId: modalForm.veterinarioId,
        NombreCompleto: (modalForm as any).nombreCompleto || '',
        Telefono: modalForm.telefono || null,
        Email: modalForm.email || null,
        Especialidad: modalForm.especialidad || null,
      };

      if (modalMode === 'edit' && modalForm.veterinarioId) {
        await updateVeterinario(modalForm.veterinarioId, payload);
      } else {
        await createVeterinario(payload);
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
    try { await deleteVeterinario(deleteId); await load(); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteId(undefined);
  };

  return (
    <div className="veterinarios-page table-mode">
      <div className="veterinarios-header">
        <h2>Veterinarios</h2>
        <div className="veterinarios-header-actions">
          <button className="btn-primary" onClick={openNew}>Nuevo Veterinario</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="veterinarios-table-wrap">
        <table className="veterinarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Especialidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {veterinarios.map(v => (
              <tr key={v.veterinarioId}>
                <td>{v.veterinarioId}</td>
                <td>{(v as any).nombreCompleto || (v as any).NombreCompleto}</td>
                <td>{v.telefono}</td>
                <td>{v.email}</td>
                <td>{v.especialidad}</td>
                <td>
                  <button onClick={() => openEdit(v.veterinarioId)}>Editar</button>
                  <button className="btn-danger" onClick={() => openDelete(v.veterinarioId)}>Eliminar</button>
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
              <h3>{modalMode === 'edit' ? 'Editar Veterinario' : 'Nuevo Veterinario'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Nombre Completo</label>
              <input value={(modalForm as any).nombreCompleto || ''} onChange={e => setModalForm({...modalForm, nombreCompleto: e.target.value})} placeholder="Nombre completo" title="Nombre completo" />
              <label>Teléfono</label>
              <input value={modalForm.telefono || ''} onChange={e => setModalForm({...modalForm, telefono: e.target.value})} placeholder="Teléfono" title="Teléfono" />
              <label>Email</label>
              <input value={modalForm.email || ''} onChange={e => setModalForm({...modalForm, email: e.target.value})} placeholder="Email" title="Email" />
              <label>Especialidad</label>
              <input value={modalForm.especialidad || ''} onChange={e => setModalForm({...modalForm, especialidad: e.target.value})} placeholder="Especialidad" title="Especialidad" />
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
              <p>¿Estás seguro de que deseas eliminar este veterinario? Esta acción no se puede deshacer.</p>
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

export default VeterinariosPage;

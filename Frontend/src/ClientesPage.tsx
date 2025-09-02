import React, { useEffect, useState } from 'react';
import { getClientes, getCliente, createCliente, updateCliente, deleteCliente } from './services/clientes';
import './ClientesPage.css';

type Cliente = {
  clienteId?: number;
  nombreCompleto?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new'|'edit'>('new');
  const [modalForm, setModalForm] = useState<Cliente>({});

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const load = async () => {
    setLoading(true); setError('');
    try { const data = await getClientes(); setClientes(data || []); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setModalMode('new'); setModalForm({}); setShowModal(true); };

  const openEdit = async (id?: number) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const data: any = await getCliente(id);
      // normalize server response to frontend-friendly keys
      const mapped: any = {
        clienteId: data.clienteId ?? data.ClienteId ?? undefined,
        nombreCompleto: data.NombreCompleto ?? data.nombreCompleto ?? '',
        direccion: data.Direccion ?? data.direccion ?? '',
        telefono: data.Telefono ?? data.telefono ?? '',
        email: data.Email ?? data.email ?? '',
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
        ClienteId: modalForm.clienteId,
        NombreCompleto: (modalForm as any).nombreCompleto || '',
        Telefono: modalForm.telefono || null,
        Email: modalForm.email || null,
        Direccion: modalForm.direccion || null,
      };

      if (modalMode === 'edit' && modalForm.clienteId) {
        await updateCliente(modalForm.clienteId, payload);
      } else {
        await createCliente(payload);
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
    try { await deleteCliente(deleteId); await load(); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteId(undefined);
  };

  return (
    <div className="clientes-page table-mode">
      <div className="clientes-header">
        <h2>Clientes</h2>
        <div className="clientes-header-actions">
          <button className="btn-primary" onClick={openNew}>Nuevo</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="clientes-table-wrap">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.clienteId}>
                <td>{c.clienteId}</td>
                <td>{(c as any).nombreCompleto || (c as any).NombreCompleto}</td>
                <td>{c.telefono}</td>
                <td>{c.email}</td>
                <td>{c.direccion}</td>
                <td>
                  <button onClick={() => openEdit(c.clienteId)}>Editar</button>
                  <button className="btn-danger" onClick={() => openDelete(c.clienteId)}>Eliminar</button>
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
              <h3>{modalMode === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Nombre</label>
              <input value={(modalForm as any).nombreCompleto || ''} onChange={e => setModalForm({...modalForm, nombreCompleto: e.target.value})} placeholder="Nombre" title="Nombre" />
              <label>Dirección</label>
              <input value={modalForm.direccion || ''} onChange={e => setModalForm({...modalForm, direccion: e.target.value})} placeholder="Dirección" title="Dirección" />
              <label>Teléfono</label>
              <input value={modalForm.telefono || ''} onChange={e => setModalForm({...modalForm, telefono: e.target.value})} placeholder="Teléfono" title="Teléfono" />
              <label>Email</label>
              <input value={modalForm.email || ''} onChange={e => setModalForm({...modalForm, email: e.target.value})} placeholder="Email" title="Email" />
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
              <p>¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.</p>
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

export default ClientesPage;

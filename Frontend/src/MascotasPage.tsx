import React, { useEffect, useState } from 'react';
import { getMascotas, getMascota, createMascota, updateMascota, deleteMascota } from './services/mascotas';
import { getClientes } from './services/clientes';
import './MascotasPage.css';

type Mascota = {
  mascotaId?: number;
  nombre?: string;
  especie?: string;
  fechaNacimiento?: string;
  clienteId?: number;
}

type Cliente = any;

const MascotasPage: React.FC = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new'|'edit'>('new');
  const [modalForm, setModalForm] = useState<Mascota>({});

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [mascotasData, clientesData] = await Promise.all([getMascotas(), getClientes()]);
      setMascotas(mascotasData || []);
      setClientes(clientesData || []);
    } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setModalMode('new'); setModalForm({}); setShowModal(true); };

  const openEdit = async (id?: number) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const data: any = await getMascota(id);
      // normalize server response to frontend-friendly keys
      const mapped: any = {
        mascotaId: data.mascotaId ?? data.MascotaId ?? undefined,
        nombre: data.Nombre ?? data.nombre ?? '',
        especie: data.Especie ?? data.especie ?? '',
        fechaNacimiento: data.FechaNacimiento ? new Date(data.FechaNacimiento).toISOString().split('T')[0] : '',
        clienteId: data.ClienteId ?? data.clienteId ?? undefined,
        cliente: data.Cliente,
      };
      setModalForm(mapped);
      setModalMode('edit');
      setShowModal(true);
    } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
  };

  const saveModal = async () => {
    if (!modalForm.clienteId) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    setLoading(true); setError('');
    try {
      // Mapear los campos del formulario al modelo esperado por el backend
      const payload: any = {
        MascotaId: modalForm.mascotaId,
        Nombre: modalForm.nombre || '',
        Especie: modalForm.especie || '',
        FechaNacimiento: modalForm.fechaNacimiento ? new Date(modalForm.fechaNacimiento).toISOString() : null,
        ClienteId: modalForm.clienteId, // Solo enviar el ID del cliente
       
      };

      if (modalMode === 'edit' && modalForm.mascotaId) {
        await updateMascota(modalForm.mascotaId, payload);
      } else {
        await createMascota(payload);
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      setError(e.message || 'Error');
    }
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
    try { await deleteMascota(deleteId); await load(); } catch (e: any) { setError(e.message || 'Error'); }
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteId(undefined);
  };

  const getClienteNombre = (clienteId?: number) => {
    const cliente = clientes.find(c => c.clienteId === clienteId);
    return cliente?.nombreCompleto || cliente?.NombreCompleto || 'Desconocido';
  };

  return (
    <div className="mascotas-page table-mode">
      <div className="mascotas-header">
        <h2>Mascotas</h2>
        <div className="mascotas-header-actions">
          <button className="btn-primary" onClick={openNew}>Nuevo</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="mascotas-table-wrap">
        <table className="mascotas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Fecha Nacimiento</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mascotas.map(m => (
              <tr key={m.mascotaId}>
                <td>{m.mascotaId}</td>
                <td>{m.nombre}</td>
                <td>{m.especie}</td>
                <td>{m.fechaNacimiento ? new Date(m.fechaNacimiento).toLocaleDateString() : ''}</td>
                <td>{getClienteNombre(m.clienteId)}</td>
                <td>
                  <button onClick={() => openEdit(m.mascotaId)}>Editar</button>
                  <button className="btn-danger" onClick={() => openDelete(m.mascotaId)}>Eliminar</button>
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
              <h3>{modalMode === 'edit' ? 'Editar Mascota' : 'Nueva Mascota'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Nombre</label>
              <input value={modalForm.nombre || ''} onChange={e => setModalForm({...modalForm, nombre: e.target.value})} placeholder="Nombre" title="Nombre" />
              <label>Especie</label>
              <input value={modalForm.especie || ''} onChange={e => setModalForm({...modalForm, especie: e.target.value})} placeholder="Especie" title="Especie" />
              <label>Fecha Nacimiento</label>
              <input type="date" value={modalForm.fechaNacimiento || ''} onChange={e => setModalForm({...modalForm, fechaNacimiento: e.target.value})} title="Fecha Nacimiento" />
              <label>Cliente</label>
              <select value={modalForm.clienteId || ''} onChange={e => setModalForm({...modalForm, clienteId: parseInt(e.target.value) || undefined})} title="Cliente">
                <option value="">Selecciona un cliente</option>
                {clientes.map(c => (
                  <option key={c.clienteId} value={c.clienteId}>{c.nombreCompleto || c.NombreCompleto}</option>
                ))}
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
              <p>¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer.</p>
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

export default MascotasPage;

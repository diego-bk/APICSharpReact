import React, { useEffect, useState } from 'react';
import { getUsuarios, getUsuario, createUsuario, updateUsuario, deleteUsuario } from './services/usuarios';
import { getVeterinarios } from './services/veterinarios';
import './UsuariosPage.css';

type Usuario = {
  usuarioId?: number;
  nombreUsuario?: string;
  contrasena?: string;
  rol?: string;
  veterinarioId?: number;
};

type Veterinario = {
  veterinarioId?: number;
  nombreCompleto?: string;
};

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit'>('new');
  const [modalForm, setModalForm] = useState<Usuario>({});

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const load = async () => {
    setError('');
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData || []);
      
      // Cargar veterinarios para el select
      const veterinariosData = await getVeterinarios();
      setVeterinarios(veterinariosData || []);
    } catch (e: any) {
      setError(e.message || 'Error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setModalMode('new');
    setModalForm({});
    setShowModal(true);
  };

  const openEdit = async (id?: number) => {
    if (!id) return;
    setError('');
    try {
      const data: any = await getUsuario(id);
      setModalForm(data);
      setModalMode('edit');
      setShowModal(true);
    } catch (e: any) {
      setError(e.message || 'Error');
    }
  };

  const saveModal = async () => {
    setError('');
    try {
      if (modalMode === 'edit' && modalForm.usuarioId) {
        await updateUsuario(modalForm.usuarioId, modalForm);
      } else {
        await createUsuario(modalForm);
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      setError(e.message || 'Error');
    }
  };

  const openDelete = (id?: number) => {
    if (!id) return;
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setError('');
    try {
      await deleteUsuario(deleteId);
      await load();
    } catch (e: any) {
      setError(e.message || 'Error');
    }
    setShowDeleteModal(false);
    setDeleteId(undefined);
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <h2>Usuarios</h2>
        <button className="btn-primary" onClick={openNew}>Nuevo Usuario</button>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre de Usuario</th>
            <th>Rol</th>
            <th>Veterinario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const veterinario = veterinarios.find(v => v.veterinarioId === u.veterinarioId);
            return (
              <tr key={u.usuarioId}>
                <td>{u.usuarioId}</td>
                <td>{u.nombreUsuario}</td>
                <td>{u.rol}</td>
                <td>{veterinario ? ((veterinario as any).nombreCompleto || (veterinario as any).NombreCompleto) : 'Sin asignar'}</td>
                <td>
                  <button onClick={() => openEdit(u.usuarioId)}>Editar</button>
                  <button className="btn-danger" onClick={() => openDelete(u.usuarioId)}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Nombre de Usuario</label>
              <input
                value={modalForm.nombreUsuario || ''}
                onChange={(e) => setModalForm({ ...modalForm, nombreUsuario: e.target.value })}
                title="Nombre de Usuario"
                placeholder="Ingrese el nombre de usuario"
              />
              <label>Contraseña</label>
              <input
                type="password"
                value={modalForm.contrasena || ''}
                onChange={(e) => setModalForm({ ...modalForm, contrasena: e.target.value })}
                title="Contraseña"
                placeholder="Ingrese la contraseña"
              />
              <label>Rol</label>
              <input
                value={modalForm.rol || ''}
                onChange={(e) => setModalForm({ ...modalForm, rol: e.target.value })}
                title="Rol"
                placeholder="Ingrese el rol del usuario"
              />
              <label>Veterinario (opcional)</label>
              <select
                value={modalForm.veterinarioId || ''}
                onChange={(e) => setModalForm({ ...modalForm, veterinarioId: e.target.value ? parseInt(e.target.value) : undefined })}
                title="Seleccionar Veterinario"
              >
                <option value="">-- Sin veterinario asignado --</option>
                {veterinarios.map(vet => (
                  <option key={vet.veterinarioId} value={vet.veterinarioId}>
                    {(vet as any).nombreCompleto || (vet as any).NombreCompleto}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveModal}>Guardar</button>
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
              <p>¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={() => { setShowDeleteModal(false); setDeleteId(undefined); }}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;

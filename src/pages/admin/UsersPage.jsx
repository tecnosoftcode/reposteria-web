import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaKey } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, updateUserPassword, deleteUser } from '../../services/api';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ id: null, password: '' });

    // Formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'cliente'
    });

    // Cargar usuarios
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Abrir modal para crear
    const openNewUser = () => {
        setIsEditing(true);
        setCurrentUser(null);
        setFormData({ nombre: '', email: '', password: '', rol: 'cliente' });
    };

    // Abrir modal para editar
    const openEditUser = (user) => {
        setIsEditing(true);
        setCurrentUser(user);
        setFormData({ nombre: user.nombre, email: user.email, rol: user.rol, password: '' });
    };

    // Cerrar modal
    const closeModal = () => {
        setIsEditing(false);
        setCurrentUser(null);
        setFormData({ nombre: '', email: '', password: '', rol: 'cliente' });
    };

    // Guardar usuario
    const saveUser = async () => {
        if (!formData.nombre.trim() || !formData.email.trim()) {
            toast.error('Nombre y email son obligatorios');
            return;
        }

        if (!currentUser && !formData.password) {
            toast.error('La contraseña es obligatoria para nuevos usuarios');
            return;
        }

        try {
            setLoading(true);
            if (currentUser) {
                await updateUser(currentUser.id, formData);
                toast.success('✅ Usuario actualizado');
            } else {
                await createUser(formData);
                toast.success('🎉 Usuario creado');
            }
            closeModal();
            await loadUsers();
        } catch (error) {
            toast.error('Error al guardar usuario');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar usuario
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            setLoading(true);
            await deleteUser(id);
            toast.success('🗑️ Usuario eliminado');
            await loadUsers();
        } catch (error) {
            toast.error('Error al eliminar usuario');
        } finally {
            setLoading(false);
        }
    };

    // Cambiar contraseña
    const handlePasswordChange = async () => {
        if (!passwordData.password) {
            toast.error('Ingresa la nueva contraseña');
            return;
        }

        try {
            setLoading(true);
            await updateUserPassword(passwordData.id, passwordData.password);
            toast.success('🔑 Contraseña cambiada');
            setShowPasswordModal(false);
            setPasswordData({ id: null, password: '' });
        } catch (error) {
            toast.error('Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>👥 Gestión de Usuarios</h1>
                <p>Controla las cuentas de acceso a tu tienda</p>
            </div>

            <div className="admin-toolbar">
                <button className="btn-primary" onClick={openNewUser} disabled={loading}>
                    <FaPlus /> Nuevo Usuario
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Creado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombre}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status-badge ${user.rol === 'admin' ? 'in-stock' : 'out-stock'}`}>
                                        {user.rol === 'admin' ? '👑 Admin' : '🛒 Cliente'}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button 
                                        className="action-btn edit" 
                                        onClick={() => openEditUser(user)}
                                        disabled={loading}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="action-btn password" 
                                        onClick={() => {
                                            setShowPasswordModal(true);
                                            setPasswordData({ id: user.id, password: '' });
                                        }}
                                        disabled={loading}
                                    >
                                        <FaKey />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => handleDelete(user.id)}
                                        disabled={loading}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear/Editar */}
            {isEditing && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{currentUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                {!currentUser && (
                                    <div className="form-group">
                                        <label>Contraseña *</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select
                                        value={formData.rol}
                                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                        disabled={loading}
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal} disabled={loading}>
                                Cancelar
                            </button>
                            <button className="btn-primary" onClick={saveUser} disabled={loading}>
                                <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cambiar Contraseña */}
            {showPasswordModal && (
                <div className="admin-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔑 Cambiar Contraseña</h2>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowPasswordModal(false)} disabled={loading}>
                                Cancelar
                            </button>
                            <button className="btn-primary" onClick={handlePasswordChange} disabled={loading}>
                                <FaSave /> Cambiar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
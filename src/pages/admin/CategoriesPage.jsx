import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        icono: ''
    });

    // Cargar categorías
    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error cargando categorías:', error);
            toast.error('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Abrir modal para crear
    const openNewCategory = () => {
        setIsEditing(true);
        setCurrentCategory(null);
        setFormData({ nombre: '', icono: '' });
    };

    // Abrir modal para editar
    const openEditCategory = (category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        setFormData({ nombre: category.nombre, icono: category.icono || '' });
    };

    // Cerrar modal
    const closeModal = () => {
        setIsEditing(false);
        setCurrentCategory(null);
        setFormData({ nombre: '', icono: '' });
    };

    // Guardar categoría
    const saveCategory = async () => {
        if (!formData.nombre.trim()) {
            toast.error('Nombre es obligatorio');
            return;
        }

        try {
            setLoading(true);
            if (currentCategory) {
                await updateCategory(currentCategory.id, formData);
                toast.success('✅ Categoría actualizada');
            } else {
                await createCategory(formData);
                toast.success('🎉 Categoría creada');
            }
            closeModal();
            await loadCategories();
        } catch (error) {
            toast.error('Error al guardar categoría');
        } finally {
            setLoading(false);
        }
    };

    // Eliminar categoría
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            setLoading(true);
            await deleteCategory(id);
            toast.success('🗑️ Categoría eliminada');
            await loadCategories();
        } catch (error) {
            toast.error('Error al eliminar categoría');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>🏷️ Gestión de Categorías</h1>
                <p>Controla las categorías de tu tienda</p>
            </div>

            <div className="admin-toolbar">
                <button className="btn-primary" onClick={openNewCategory} disabled={loading}>
                    <FaPlus /> Nuevo Categoría
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Icono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.nombre}</td>
                                <td>{category.icono || '-'}</td>
                                <td className="actions-cell">
                                    <button 
                                        className="action-btn edit" 
                                        onClick={() => openEditCategory(category)}
                                        disabled={loading}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => handleDelete(category.id)}
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
                            <h2>{currentCategory ? '✏️ Editar Categoría' : '➕ Nuevo Categoría'}</h2>
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
                                    <label>Icono (opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.icono}
                                        onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                                        placeholder="Ej: 🎂"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal} disabled={loading}>
                                Cancelar
                            </button>
                            <button className="btn-primary" onClick={saveCategory} disabled={loading}>
                                <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
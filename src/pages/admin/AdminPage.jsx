import { useState, useRef, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, 
  FaSearch, FaCloudUploadAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';
import { createProduct, updateProduct, deleteProduct, getProducts, getCategories } from '../../services/api';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    imageFile: null,
    discount: 0,
    inStock: true,
    sizes: '',
    flavors: ''
  });

  // ==========================================
  // CARGAR PRODUCTOS Y CATEGORÍAS
  // ==========================================
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  // Cargar al montar
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // ==========================================
  // 🔥 MANEJO DE IMÁGENES (HEIC + Compresión universal)
  // ==========================================
  const handleImageUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    console.log('📸 Archivo original:', file.name, file.type, (file.size / 1024 / 1024).toFixed(2), 'MB');

    // 🔥 Validar que sea imagen (o HEIC sin MIME type)
    const isImage = 
      file.type.startsWith('image/') || 
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif');

    if (!isImage) {
      toast.error('❌ Por favor selecciona una imagen válida');
      return;
    }

    try {
      // ==========================================
      // 🔥 PASO 1: CONVERTIR HEIC A JPG
      // ==========================================
      const isHeic = 
        file.type === 'image/heic' || 
        file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

      if (isHeic) {
        try {
          toast.loading('Convirtiendo imagen HEIC...', { id: 'heic' });
          console.log('🔄 Convirtiendo HEIC a JPG...');

          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.85
          });

          // Si devuelve un array, tomar el primero
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

          file = new File(
            [blob],
            file.name.replace(/\.(heic|heif)$/i, '.jpg'),
            { type: 'image/jpeg' }
          );

          console.log('✅ HEIC convertido:', (file.size / 1024 / 1024).toFixed(2), 'MB');
          toast.success('✅ Imagen convertida', { id: 'heic' });
        } catch (error) {
          console.error('❌ Error convirtiendo HEIC:', error);
          toast.error('❌ No se pudo convertir la imagen HEIC', { id: 'heic' });
          return;
        }
      }

      // ==========================================
      // 🔥 PASO 2: COMPRIMIR SI ES MAYOR A 1.5MB
      // ==========================================
      let finalFile = file;

      if (file.size > 1.5 * 1024 * 1024) {
        try {
          toast.loading('Comprimiendo imagen...', { id: 'compress' });
          console.log('🗜️ Comprimiendo...');

          const options = {
            maxSizeMB: 1.5,           // Máximo 1.5 MB
            maxWidthOrHeight: 1920,   // Máximo 1920px
            useWebWorker: true,       // Más rápido, no bloquea
            fileType: 'image/jpeg',
            initialQuality: 0.85
          };

          finalFile = await imageCompression(file, options);

          console.log('✅ Comprimido:', (finalFile.size / 1024 / 1024).toFixed(2), 'MB');
          toast.success('✅ Imagen comprimida', { id: 'compress' });
        } catch (error) {
          console.error('❌ Error comprimiendo:', error);
          toast.error('⚠️ Continuando sin comprimir', { id: 'compress' });
          finalFile = file;
        }
      }

      // ==========================================
      // 🔥 PASO 3: VALIDAR TAMAÑO FINAL
      // ==========================================
      if (finalFile.size > 15 * 1024 * 1024) {
        toast.error('❌ La imagen debe ser menor a 15MB');
        return;
      }

      const previewUrl = URL.createObjectURL(finalFile);
      setFormData(prev => ({ ...prev, image: previewUrl, imageFile: finalFile }));
      toast.success('✅ Imagen lista para subir');

    } catch (error) {
      console.error('❌ Error procesando imagen:', error);
      toast.error('❌ Error al procesar la imagen');
    }
  };

  // ==========================================
  // MANEJO DEL FORMULARIO
  // ==========================================
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ==========================================
  // ABRIR MODAL
  // ==========================================
  const openNewProduct = () => {
    setIsEditing(true);
    setCurrentProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.id || '',
      price: '',
      description: '',
      image: '',
      imageFile: null,
      discount: 0,
      inStock: true,
      sizes: '',
      flavors: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditProduct = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.nombre || product.name || '',
      category: product.categoria_id || '',
      price: product.precio || product.price || '',
      description: product.descripcion || product.description || '',
      image: product.imagen || product.image || '',
      imageFile: null,
      discount: product.descuento || product.discount || 0,
      inStock: (product.en_stock !== false && product.inStock !== false),
      sizes: product.sizes ? product.sizes.join(', ') : '',
      flavors: product.flavors ? product.flavors.join(', ') : ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.id || '',
      price: '',
      description: '',
      image: '',
      imageFile: null,
      discount: 0,
      inStock: true,
      sizes: '',
      flavors: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==========================================
  // GUARDAR PRODUCTO
  // ==========================================
  const saveProduct = async () => {
    // Validar campos
    if (!formData.name.trim()) {
      toast.error('Por favor ingresa el nombre del producto');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Por favor ingresa un precio válido');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Por favor ingresa una descripción');
      return;
    }
    if (!formData.image && !formData.imageFile) {
      toast.error('Por favor sube una imagen del producto');
      return;
    }

    try {
      setLoading(true);

      // 🔥 IMPORTANTE: Usar FormData para enviar el archivo
      const formDataToSend = new FormData();
      
      // Agregar todos los campos
      formDataToSend.append('nombre', formData.name.trim());
      formDataToSend.append('descripcion', formData.description.trim());
      formDataToSend.append('precio', parseFloat(formData.price));
      formDataToSend.append('categoria_id', formData.category);
      formDataToSend.append('descuento', parseInt(formData.discount) || 0);
      formDataToSend.append('en_stock', formData.inStock ? '1' : '0');

      // Agregar tamaños
      if (formData.sizes) {
        const sizes = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
        sizes.forEach(size => formDataToSend.append('sizes', size));
      }

      // Agregar sabores
      if (formData.flavors) {
        const flavors = formData.flavors.split(',').map(s => s.trim()).filter(Boolean);
        flavors.forEach(flavor => formDataToSend.append('flavors', flavor));
      }

      // 🔥 IMPORTANTE: Agregar el archivo de imagen
      if (formData.imageFile) {
        formDataToSend.append('imagen', formData.imageFile);
        console.log('📸 Enviando archivo:', formData.imageFile.name, formData.imageFile.size, 'bytes');
      }

      let result;
      if (currentProduct) {
        result = await updateProduct(currentProduct.id, formDataToSend);
        toast.success('✅ Producto actualizado correctamente');
      } else {
        result = await createProduct(formDataToSend);
        toast.success('🎉 Producto creado correctamente');
      }

      closeModal();
      await loadProducts();
    } catch (error) {
      console.error('Error guardando producto:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      toast.error('Error al guardar producto: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      setLoading(true);
      await deleteProduct(id);
      toast.success('🗑️ Producto eliminado');
      await loadProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================
  const filteredProducts = products.filter(product => {
    const nombre = product.nombre || product.name || '';
    const categoriaId = product.categoria_id;
    const matchSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = 
      filterCategory === 'todos' || 
      Number(categoriaId) === Number(filterCategory);
    
    return matchSearch && matchCategory;
  });

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================
  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => (p.en_stock !== false && p.inStock !== false)).length,
    outOfStock: products.filter(p => (p.en_stock === false || p.inStock === false)).length,
    categories: new Set(products.map(p => p.categoria_id)).size
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1>⚙️ Panel de Administración</h1>
        <p>Gestiona tus productos, pedidos y configuración</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Total Productos</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🟢</span>
          <div className="stat-info">
            <span className="stat-value">{stats.inStock}</span>
            <span className="stat-label">En Stock</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔴</span>
          <div className="stat-info">
            <span className="stat-value">{stats.outOfStock}</span>
            <span className="stat-label">Agotados</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏷️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.categories}</span>
            <span className="stat-label">Categorías</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filters">
          <select 
            value={filterCategory}
            onChange={(e) => {
              const value = e.target.value;
              setFilterCategory(value === 'todos' ? 'todos' : Number(value));
            }}
          >
            <option value="todos">📦 Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icono ? `${cat.icono} ${cat.nombre}` : cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={openNewProduct} disabled={loading}>
          <FaPlus /> Nuevo Producto
        </button>
      </div>

      {/* Tabla */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Descuento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const nombre = product.nombre || product.name || 'Sin nombre';
              const imagen = product.imagen || product.image || 'https://via.placeholder.com/50/FFE4E1/8B4513?text=?';
              const categoria = categories.find(c => Number(c.id) === Number(product.categoria_id));
              const catLabel = categoria ? (categoria.icono ? `${categoria.icono} ${categoria.nombre}` : categoria.nombre) : 'Sin categoría';
              const precio = parseFloat(product.precio || product.price) || 0;
              const descuento = parseInt(product.descuento || product.discount) || 0;
              const enStock = (product.en_stock !== false && product.inStock !== false);

              return (
                <tr key={product.id}>
                  <td className="product-image-cell">
                    <img src={imagen} alt={nombre} />
                  </td>
                  <td className="product-name-cell">{nombre}</td>
                  <td>
                    <span className="category-badge">{catLabel}</span>
                  </td>
                  <td>${precio.toFixed(2)}</td>
                  <td>{descuento > 0 ? `${descuento}%` : '-'}</td>
                  <td>
                    <span className={`status-badge ${enStock ? 'in-stock' : 'out-stock'}`}>
                      {enStock ? '✅ Disponible' : '❌ Agotado'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn edit"
                      onClick={() => openEditProduct(product)}
                      title="Editar"
                      disabled={loading}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Eliminar"
                      disabled={loading}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="admin-empty">
            <p>No hay productos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN/CREACIÓN */}
      {isEditing && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
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
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ej: Torta de Chocolate"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    disabled={loading}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icono ? `${cat.icono} ${cat.nombre}` : cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Precio *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="35.00"
                    step="0.01"
                    min="0"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleFormChange}
                    placeholder="10"
                    min="0"
                    max="100"
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Descripción detallada del producto..."
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Imagen del Producto *</label>
                  <div className="image-upload-container">
                    {formData.image ? (
                      <div className="image-preview">
                        <img src={formData.image} alt="Vista previa" />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, image: '', imageFile: null }));
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          disabled={loading}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="upload-area">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          ref={fileInputRef}
                          disabled={loading}
                        />
                        <label htmlFor="image-upload" className="upload-label">
                          <FaCloudUploadAlt className="upload-icon" />
                          <span>Haz clic o arrastra una imagen</span>
                          <small>JPG, PNG, GIF, WEBP, HEIC (max 15MB)</small>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Tamaños (separados por coma)</label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleFormChange}
                    placeholder="Pequeña, Mediana, Grande"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Sabores (separados por coma)</label>
                  <input
                    type="text"
                    name="flavors"
                    value={formData.flavors}
                    onChange={handleFormChange}
                    placeholder="Chocolate, Vainilla, Fresa"
                    disabled={loading}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleFormChange}
                      disabled={loading}
                    />
                    Producto disponible
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal} disabled={loading}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={saveProduct} disabled={loading}>
                <FaSave /> {loading ? 'Guardando...' : (currentProduct ? 'Actualizar' : 'Crear')} Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
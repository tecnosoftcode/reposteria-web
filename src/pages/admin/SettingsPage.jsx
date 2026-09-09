import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '../../services/api';
import '../styles/admin/settings.css'; // 🔥 IMPORTACIÓN DEL CSS

const SettingsPage = () => {
    const [deliveryPrice, setDeliveryPrice] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Formulario para agregar método de pago
    const [newMethod, setNewMethod] = useState({
        type: 'efectivo',
        banco: '',
        telefono: '',
        cedula: '',
        numero_cuenta: ''
    });

    // Cargar configuración
    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            if (data) {
                setDeliveryPrice(data.delivery_price || 0);
                setPaymentMethods(data.payment_methods || []);
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Agregar método de pago
    const addPaymentMethod = () => {
        if (!newMethod.type.trim()) {
            toast.error('El tipo de método es obligatorio');
            return;
        }

        // Validar según el tipo
        if (newMethod.type === 'pago_movil') {
            if (!newMethod.banco.trim() || !newMethod.telefono.trim() || !newMethod.cedula.trim()) {
                toast.error('Banco, teléfono y cédula son obligatorios para Pago Móvil');
                return;
            }
        }

        if (newMethod.type === 'transferencia') {
            if (!newMethod.numero_cuenta.trim() || !newMethod.cedula.trim() || !newMethod.telefono.trim()) {
                toast.error('Número de cuenta, cédula y teléfono son obligatorios para Transferencia');
                return;
            }
        }

        // Si es efectivo, solo se agrega con datos vacíos
        const methodData = {
            ...newMethod,
            name: newMethod.type === 'efectivo' ? 'Efectivo' : (newMethod.type === 'pago_movil' ? 'Pago Móvil' : 'Transferencia')
        };

        setPaymentMethods([...paymentMethods, methodData]);
        setNewMethod({ type: 'efectivo', banco: '', telefono: '', cedula: '', numero_cuenta: '' });
    };

    // Eliminar método de pago
    const deletePaymentMethod = (index) => {
        const updated = [...paymentMethods];
        updated.splice(index, 1);
        setPaymentMethods(updated);
    };

    // Guardar configuración
    const saveSettings = async () => {
        try {
            setLoading(true);
            await updateSettings({
                delivery_price: deliveryPrice,
                payment_methods: paymentMethods
            });
            toast.success('✅ Configuración guardada exitosamente');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>⚙️ Configuración de la Tienda</h1>
                <p>Personaliza la entrega y los métodos de pago</p>
            </div>

            {/* Delivery */}
            <div className="settings-section">
                <h2>🚚 Precio de Delivery</h2>
                <div className="form-group">
                    <label>Precio del envío ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deliveryPrice}
                        onChange={(e) => setDeliveryPrice(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Métodos de pago */}
            <div className="settings-section">
                <h2>💳 Métodos de Pago</h2>
                
                {/* Lista de métodos existentes */}
                <div className="payment-methods-list">
                    {paymentMethods.map((method, index) => (
                        <div key={index} className="payment-method-item">
                            <span className="method-icon">
                                {method.type === 'efectivo' ? '💵' : (method.type === 'pago_movil' ? '📱' : '🏦')}
                            </span>
                            <div className="method-info">
                                <strong>{method.name}</strong>
                                {method.type === 'pago_movil' && (
                                    <p>Banco: {method.banco} | Teléfono: {method.telefono} | Cédula: {method.cedula}</p>
                                )}
                                {method.type === 'transferencia' && (
                                    <p>Número de cuenta: {method.numero_cuenta} | Cédula: {method.cedula} | Teléfono: {method.telefono}</p>
                                )}
                                {method.type === 'efectivo' && (
                                    <p>Acordar con el vendedor</p>
                                )}
                            </div>
                            <button 
                                className="action-btn delete"
                                onClick={() => deletePaymentMethod(index)}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Formulario para agregar nuevo método */}
                <div className="payment-method-form">
                    <div className="form-group">
                        <label>Tipo de método</label>
                        <select
                            value={newMethod.type}
                            onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                        >
                            <option value="efectivo">💵 Efectivo</option>
                            <option value="pago_movil">📱 Pago Móvil</option>
                            <option value="transferencia">🏦 Transferencia</option>
                        </select>
                    </div>

                    {/* Campos según tipo */}
                    {newMethod.type === 'pago_movil' && (
                        <>
                            <div className="form-group">
                                <label>Banco</label>
                                <input
                                    type="text"
                                    value={newMethod.banco}
                                    onChange={(e) => setNewMethod({ ...newMethod, banco: e.target.value })}
                                    placeholder="Ej: Banco de Venezuela"
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    value={newMethod.telefono}
                                    onChange={(e) => setNewMethod({ ...newMethod, telefono: e.target.value })}
                                    placeholder="0412-1234567"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cédula</label>
                                <input
                                    type="text"
                                    value={newMethod.cedula}
                                    onChange={(e) => setNewMethod({ ...newMethod, cedula: e.target.value })}
                                    placeholder="V-12345678"
                                />
                            </div>
                        </>
                    )}

                    {newMethod.type === 'transferencia' && (
                        <>
                            <div className="form-group">
                                <label>Número de cuenta</label>
                                <input
                                    type="text"
                                    value={newMethod.numero_cuenta}
                                    onChange={(e) => setNewMethod({ ...newMethod, numero_cuenta: e.target.value })}
                                    placeholder="0134-1234567890"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cédula</label>
                                <input
                                    type="text"
                                    value={newMethod.cedula}
                                    onChange={(e) => setNewMethod({ ...newMethod, cedula: e.target.value })}
                                    placeholder="V-12345678"
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    value={newMethod.telefono}
                                    onChange={(e) => setNewMethod({ ...newMethod, telefono: e.target.value })}
                                    placeholder="0412-1234567"
                                />
                            </div>
                        </>
                    )}

                    {newMethod.type === 'efectivo' && (
                        <p style={{ color: 'gray', fontSize: '0.9rem' }}>
                            💵 El cliente verá "Acordar con el vendedor".
                        </p>
                    )}

                    <button className="btn-primary" onClick={addPaymentMethod}>
                        <FaPlus /> Agregar Método
                    </button>
                </div>
            </div>

            <div className="settings-footer">
                <button className="btn-primary" onClick={saveSettings} disabled={loading}>
                    <FaSave /> {loading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
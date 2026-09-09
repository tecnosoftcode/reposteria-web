import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '../../services/api';

const SettingsPage = () => {
    const [deliveryPrice, setDeliveryPrice] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Formulario para agregar método de pago
    const [newMethod, setNewMethod] = useState({
        name: '',
        details: '',
        icon: '💳'
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
        if (!newMethod.name.trim()) {
            toast.error('El nombre del método es obligatorio');
            return;
        }
        if (!newMethod.details.trim()) {
            toast.error('Los detalles son obligatorios');
            return;
        }
        
        setPaymentMethods([...paymentMethods, newMethod]);
        setNewMethod({ name: '', details: '', icon: '💳' });
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
                            <span className="method-icon">{method.icon}</span>
                            <div className="method-info">
                                <strong>{method.name}</strong>
                                <p>{method.details}</p>
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
                        <label>Nombre del método</label>
                        <input
                            type="text"
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                            placeholder="Ej: Pago Móvil"
                        />
                    </div>
                    <div className="form-group">
                        <label>Detalles (banco, teléfono, etc.)</label>
                        <textarea
                            value={newMethod.details}
                            onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })}
                            placeholder="Ej: Banco de Venezuela, 0123456789, CI: 12345678"
                            rows="3"
                        />
                    </div>
                    <div className="form-group">
                        <label>Icono</label>
                        <select
                            value={newMethod.icon}
                            onChange={(e) => setNewMethod({ ...newMethod, icon: e.target.value })}
                        >
                            <option value="💳">💳 Tarjeta</option>
                            <option value="🏦">🏦 Banco</option>
                            <option value="📱">📱 Pago Móvil</option>
                            <option value="💵">💵 Efectivo</option>
                            <option value="🪙">🪙 Cripto</option>
                        </select>
                    </div>
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
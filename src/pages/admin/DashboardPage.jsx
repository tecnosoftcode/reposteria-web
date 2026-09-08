import { useState, useEffect } from 'react';
import { getOrders, getProducts } from '../../services/api';
import { 
  FaBox, FaShoppingCart, FaUsers, FaDollarSign, 
  FaClock, FaCheckCircle, FaTruck, FaTimesCircle 
} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, 
  PieChart, Pie, Cell 
} from 'recharts';

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    lowStock: 0
  });

  // Colores para gráficos
  const COLORS = ['#8B4513', '#D4A574', '#FF6B6B', '#4CAF50', '#2196F3', '#FF9800'];

  // ==========================================
  // CARGAR DATOS
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ordersData, productsData] = await Promise.all([
          getOrders(),
          getProducts()
        ]);

        setOrders(ordersData || []);
        setProducts(productsData || []);

        // Calcular estadísticas
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        const pendingOrders = ordersData.filter(o => o.estado === 'pendiente' || o.estado === 'confirmado').length;
        const deliveredOrders = ordersData.filter(o => o.estado === 'entregado').length;
        const lowStock = productsData.filter(p => p.en_stock === false || p.en_stock === 0).length;

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          deliveredOrders,
          totalProducts: productsData.length,
          lowStock
        });

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================
  // DATOS PARA GRÁFICAS
  // ==========================================

  // Ventas por día (últimos 7 días)
  const getSalesByDay = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es-ES', { weekday: 'short' });
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const total = dayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      
      last7Days.push({
        dia: dateStr,
        ventas: total,
        pedidos: dayOrders.length
      });
    }
    
    return last7Days;
  };

  // Ventas por categoría
  const getSalesByCategory = () => {
    const categoryMap = {};
    
    orders.forEach(order => {
      if (order.detalles) {
        order.detalles.forEach(detalle => {
          const cat = detalle.categoria || 'Sin categoría';
          if (!categoryMap[cat]) {
            categoryMap[cat] = 0;
          }
          categoryMap[cat] += parseFloat(detalle.subtotal) || 0;
        });
      }
    });
    
    return Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    }));
  };

  // Estado de pedidos
  const getOrderStatusData = () => {
    const statusMap = {};
    orders.forEach(order => {
      const estado = order.estado || 'pendiente';
      if (!statusMap[estado]) {
        statusMap[estado] = 0;
      }
      statusMap[estado]++;
    });
    
    const labels = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      preparando: 'Preparando',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    
    return Object.keys(statusMap).map(key => ({
      name: labels[key] || key,
      value: statusMap[key]
    }));
  };

  // Datos para gráficas
  const salesByDay = getSalesByDay();
  const salesByCategory = getSalesByCategory();
  const orderStatusData = getOrderStatusData();

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Resumen de tu negocio</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E3F2FD' }}>
            <FaDollarSign style={{ color: '#1976D2' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">${stats.totalRevenue.toFixed(2)}</span>
            <span className="stat-label">Ingresos Totales</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9' }}>
            <FaShoppingCart style={{ color: '#388E3C' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Pedidos Totales</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0' }}>
            <FaClock style={{ color: '#F57C00' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingOrders}</span>
            <span className="stat-label">Pedidos Pendientes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FCE4EC' }}>
            <FaCheckCircle style={{ color: '#C62828' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.deliveredOrders}</span>
            <span className="stat-label">Pedidos Entregados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E5F5' }}>
            <FaBox style={{ color: '#6A1B9A' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Productos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFEBEE' }}>
            <FaTimesCircle style={{ color: '#C62828' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.lowStock}</span>
            <span className="stat-label">Productos Agotados</span>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="dashboard-charts">
        {/* Ventas por día */}
        <div className="chart-card">
          <h3>📈 Ventas Últimos 7 Días</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => `Día: ${label}`}
              />
              <Legend />
              <Bar dataKey="ventas" fill="#8B4513" name="Ventas ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de pedidos */}
        <div className="chart-card">
          <h3>📊 Estado de Pedidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} pedidos`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por categoría */}
        <div className="chart-card full-width">
          <h3>🏷️ Ventas por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#D4A574" name="Ventas ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Últimos pedidos */}
        <div className="chart-card full-width">
          <h3>🔄 Últimos Pedidos</h3>
          <div className="recent-orders">
            {orders.slice(0, 5).map((order, index) => (
              <div key={index} className="recent-order-item">
                <div className="recent-order-info">
                  <span className="recent-order-id">#{order.id}</span>
                  <span className="recent-order-client">
                    {order.cliente_nombre} {order.cliente_apellido}
                  </span>
                </div>
                <div className="recent-order-details">
                  <span className="recent-order-total">${parseFloat(order.total).toFixed(2)}</span>
                  <span className={`recent-order-status ${order.estado}`}>
                    {order.estado}
                  </span>
                  <span className="recent-order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p style={{ textAlign: 'center', color: 'gray', padding: '1rem' }}>
                No hay pedidos aún
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
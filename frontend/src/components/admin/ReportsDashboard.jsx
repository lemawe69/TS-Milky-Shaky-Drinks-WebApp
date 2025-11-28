import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ['#3AB0FF', '#2A7FCC', '#00D9FF', '#00A8CC', '#005A87', '#FF6B6B', '#4ECDC4', '#45B7D1'];

export default function ReportsDashboard() {
  const [topFlavours, setTopFlavours] = useState([]);
  const [orders, setOrders] = useState([]);
  const [weeklyOrders, setWeeklyOrders] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    highestOrderValue: 0,
    lowestOrderValue: 0,
    topCustomer: null,
    topFlavour: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [viewMode, setViewMode] = useState('daily');
  const [fromDate] = useState(new Date(Date.now() - 30 * 24 * 3600 * 1000));
  const [toDate] = useState(new Date());

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 30000);
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, []);

  async function loadReports() {
    try {
      const [f, o, c, s, w, m] = await Promise.all([
        api.get("/reports/top-flavours"),
        api.get("/reports/orders", { params: { from: fromDate.toISOString(), to: toDate.toISOString() } }),
        api.get("/reports/customers"),
        api.get("/reports/order-stats"),
        api.get("/reports/weekly"),
        api.get("/reports/monthly"),
      ]);
      
      setTopFlavours(f.data || []);
      setOrders(o.data || []);
      setCustomers(c.data || []);
      setWeeklyOrders((w.data || []).reverse());
      setMonthlyOrders((m.data || []).reverse());

      const totalOrders = Math.max(0, (o.data || []).reduce((sum, day) => sum + (parseInt(day.count) || 0), 0));
      const totalRevenue = parseFloat(((o.data || []).reduce((sum, day) => sum + (parseFloat(day.revenue) || 0), 0)).toFixed(2));
      const totalCustomers = (c.data || []).filter(customer => customer.orders > 0).length;
      const avgOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

      const topCustomer = (c.data || []).filter(customer => customer.orders > 0).length > 0 ? c.data[0] : null;
      const topFlavour = (f.data || []).length > 0 ? f.data[0] : null;
      
      const statsData = s.data || { min_order: 0, max_order: 0 };
      setStats({
        totalOrders: Math.max(0, totalOrders),
        totalRevenue,
        totalCustomers,
        avgOrderValue,
        highestOrderValue: parseFloat((statsData.max_order || 0).toFixed(2)),
        lowestOrderValue: parseFloat((statsData.min_order || 0).toFixed(2)),
        topCustomer,
        topFlavour,
      });
    } catch (err) {
      console.error("Failed to load reports:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = viewMode === 'daily' ? orders : viewMode === 'weekly' ? weeklyOrders : monthlyOrders;

  if (loading) {
    return (
      <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
        <div className="text-gray-400">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">📊 Total Orders</div>
          <div className="text-3xl font-bold text-blue-400">{Math.max(0, parseInt(stats.totalOrders) || 0)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">💰 Total Revenue</div>
          <div className="text-3xl font-bold text-green-400">{parseFloat(stats.totalRevenue || 0).toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">👥 Total Customers</div>
          <div className="text-3xl font-bold text-purple-400">{stats.totalCustomers}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl border border-yellow-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">💵 Avg Order Value</div>
          <div className="text-3xl font-bold text-yellow-400">{parseFloat(stats.avgOrderValue || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">🔝 Highest Order</div>
          <div className="text-2xl font-bold text-cyan-400">{parseFloat(stats.highestOrderValue || 0).toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl border border-red-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">🔻 Lowest Order</div>
          <div className="text-2xl font-bold text-red-400">{parseFloat(stats.lowestOrderValue || 0).toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 rounded-xl border border-pink-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">⭐ Top Flavour</div>
          <div className="text-2xl font-bold text-pink-400">{stats.topFlavour?.flavour || 'N/A'}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.topFlavour?.volume || 0} sold</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl border border-orange-500/30 p-4">
          <div className="text-sm text-gray-400 mb-2">👑 Top Customer</div>
          <div className="text-2xl font-bold text-orange-400">{stats.topCustomer?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500 mt-1">{parseFloat(stats.topCustomer?.total_spent || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'daily'
                ? 'bg-primary text-deep'
                : 'bg-deep/50 border border-primary/30 text-gray-300 hover:bg-deep/70'
            }`}
          >
            📅 Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'weekly'
                ? 'bg-primary text-deep'
                : 'bg-deep/50 border border-primary/30 text-gray-300 hover:bg-deep/70'
            }`}
          >
            📊 Weekly
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'monthly'
                ? 'bg-primary text-deep'
                : 'bg-deep/50 border border-primary/30 text-gray-300 hover:bg-deep/70'
            }`}
          >
            📈 Monthly
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3a52" />
                <XAxis dataKey={viewMode === 'daily' ? 'day' : viewMode === 'weekly' ? 'week' : 'month'} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #3AB0FF' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3AB0FF" strokeWidth={2} dot={{ fill: '#3AB0FF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Orders Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3a52" />
                <XAxis dataKey={viewMode === 'daily' ? 'day' : viewMode === 'weekly' ? 'week' : 'month'} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #3AB0FF' }} />
                <Legend />
                <Bar dataKey="orders" fill="#3AB0FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
          <h3 className="text-lg font-bold text-primary mb-4">💳 Top Customer Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customers.slice(0, 6).map(c => ({ ...c, total_spent: parseFloat(c.total_spent || 0) }))}
                dataKey="total_spent"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${parseFloat(entry.total_spent || 0).toFixed(2)}`}
              >
                {customers.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${parseFloat(value || 0).toFixed(2)}`} contentStyle={{ backgroundColor: '#264653', border: '1px solid #3AB0FF' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
          <h3 className="text-lg font-bold text-primary mb-4">👑 Top 10 Customers</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {customers.slice(0, 10).map((c, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-deep/50 rounded-lg hover:bg-deep/70 transition">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-primary">{i + 1}</div>
                  <div>
                    <div className="text-gray-300 font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.orders} orders</div>
                  </div>
                </div>
                <span className="font-bold text-green-400">{parseFloat(c.total_spent || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-paper/80 rounded-xl border border-primary/30 p-6">
        <h3 className="text-lg font-bold text-primary mb-4">
          {viewMode === 'daily' ? '📅 Daily' : viewMode === 'weekly' ? '📊 Weekly' : '📈 Monthly'} Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="px-4 py-2 text-left text-gray-400">{viewMode === 'daily' ? 'Date' : viewMode === 'weekly' ? 'Week' : 'Month'}</th>
                <th className="px-4 py-2 text-right text-gray-400">Orders</th>
                <th className="px-4 py-2 text-right text-gray-400">Revenue</th>
                <th className="px-4 py-2 text-right text-gray-400">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((o, i) => (
                <tr key={i} className="border-b border-primary/10 hover:bg-deep/50 transition">
                  <td className="px-4 py-2 text-gray-300">{viewMode === 'daily' ? o.day : viewMode === 'weekly' ? o.week : o.month}</td>
                  <td className="px-4 py-2 text-right font-semibold text-blue-400">{o.orders}</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-400">{parseFloat(o.revenue || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-yellow-400">{o.orders > 0 ? (parseFloat(o.revenue) / o.orders).toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

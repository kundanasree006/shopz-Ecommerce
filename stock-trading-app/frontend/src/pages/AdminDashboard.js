import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newStock, setNewStock] = useState({ symbol: "", name: "", price: "", sector: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, stocksRes, txRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/stocks"),
        api.get("/admin/transactions"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStocks(stocksRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await api.post("/stocks", {
        ...newStock,
        price: Number(newStock.price),
      });
      setMessage(`Stock ${newStock.symbol.toUpperCase()} added`);
      setNewStock({ symbol: "", name: "", price: "", sector: "" });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add stock");
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const deactivateStock = async (stock) => {
    try {
      await api.delete(`/stocks/${stock._id}`);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {stats && (
        <div className="row my-3">
          <div className="col-md-3"><div className="card text-bg-primary"><div className="card-body"><h6>Users</h6><h4>{stats.userCount}</h4></div></div></div>
          <div className="col-md-3"><div className="card text-bg-secondary"><div className="card-body"><h6>Active Stocks</h6><h4>{stats.stockCount}</h4></div></div></div>
          <div className="col-md-3"><div className="card text-bg-dark"><div className="card-body"><h6>Transactions</h6><h4>{stats.transactionCount}</h4></div></div></div>
          <div className="col-md-3"><div className="card text-bg-success"><div className="card-body"><h6>Total Volume</h6><h4>${stats.totalTradedVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4></div></div></div>
        </div>
      )}

      <ul className="nav nav-tabs mb-3">
        {["overview", "users", "stocks", "transactions"].map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {tab === "overview" && (
        <div>
          <p className="text-muted">Use the tabs above to manage users, stock listings, and monitor trading activity.</p>
        </div>
      )}

      {tab === "users" && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Balance</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>${u.balance.toFixed(2)}</td>
                  <td>{u.isActive ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Disabled</span>}</td>
                  <td>
                    {u.role !== "ADMIN" && (
                      <button className="btn btn-sm btn-outline-warning" onClick={() => toggleUserStatus(u)}>
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "stocks" && (
        <div>
          <form className="row g-2 mb-4" onSubmit={handleAddStock}>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="col-md-2">
              <input className="form-control" placeholder="Symbol" value={newStock.symbol} onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Company name" value={newStock.name} onChange={(e) => setNewStock({ ...newStock, name: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="number" step="0.01" className="form-control" placeholder="Price" value={newStock.price} onChange={(e) => setNewStock({ ...newStock, price: e.target.value })} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Sector" value={newStock.sector} onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100">Add Stock</button>
            </div>
          </form>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead><tr><th>Symbol</th><th>Name</th><th>Sector</th><th>Price</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-bold">{s.symbol}</td>
                    <td>{s.name}</td>
                    <td>{s.sector}</td>
                    <td>${s.price.toFixed(2)}</td>
                    <td>{s.isActive ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>}</td>
                    <td>
                      {s.isActive && <button className="btn btn-sm btn-outline-danger" onClick={() => deactivateStock(s)}>Deactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>User</th><th>Symbol</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{t.user?.name} ({t.user?.email})</td>
                  <td>{t.symbol}</td>
                  <td><span className={`badge ${t.type === "BUY" ? "bg-success" : "bg-danger"}`}>{t.type}</span></td>
                  <td>{t.quantity}</td>
                  <td>${t.price.toFixed(2)}</td>
                  <td>${t.total.toFixed(2)}</td>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");

  const loadStocks = async (query = "") => {
    try {
      const res = await api.get("/stocks", { params: query ? { search: query } : {} });
      setStocks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStocks();
    const interval = setInterval(() => loadStocks(search), 5000); // live price polling
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStocks(search);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Market</h2>
        <form className="d-flex" onSubmit={handleSearch}>
          <input
            className="form-control me-2"
            placeholder="Search symbol or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Sector</th>
              <th>Price</th>
              <th>Day High</th>
              <th>Day Low</th>
              <th>Volume</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => (
              <tr key={s._id}>
                <td className="fw-bold">{s.symbol}</td>
                <td>{s.name}</td>
                <td>{s.sector}</td>
                <td>${s.price.toFixed(2)}</td>
                <td>${s.dayHigh?.toFixed(2)}</td>
                <td>${s.dayLow?.toFixed(2)}</td>
                <td>{s.volume?.toLocaleString()}</td>
                <td>
                  <Link to={`/stock/${s.symbol}`} className="btn btn-sm btn-primary">View</Link>
                </td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">No stocks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Market;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);

  const loadData = async () => {
    try {
      const [stocksRes, portfolioRes] = await Promise.all([
        api.get("/stocks"),
        api.get("/portfolio"),
      ]);
      setStocks(stocksRes.data.slice(0, 6));
      setPortfolio(portfolioRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // live-ish polling refresh
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mt-4">
      <h2>Welcome back, {user?.name}</h2>

      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card text-bg-primary mb-3">
            <div className="card-body">
              <h6 className="card-title">Cash Balance</h6>
              <h4>${Number(portfolio?.balance ?? user?.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-secondary mb-3">
            <div className="card-body">
              <h6 className="card-title">Invested</h6>
              <h4>${Number(portfolio?.totalInvested ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-dark mb-3">
            <div className="card-body">
              <h6 className="card-title">Current Value</h6>
              <h4>${Number(portfolio?.currentValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card mb-3 ${(portfolio?.profitLoss ?? 0) >= 0 ? "text-bg-success" : "text-bg-danger"}`}>
            <div className="card-body">
              <h6 className="card-title">Profit / Loss</h6>
              <h4>${Number(portfolio?.profitLoss ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h4>Featured Stocks</h4>
        <Link to="/market" className="btn btn-outline-primary btn-sm">View Full Market</Link>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
              <th>Day High</th>
              <th>Day Low</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => (
              <tr key={s._id}>
                <td className="fw-bold">{s.symbol}</td>
                <td>{s.name}</td>
                <td>${s.price.toFixed(2)}</td>
                <td>${s.dayHigh?.toFixed(2)}</td>
                <td>${s.dayLow?.toFixed(2)}</td>
                <td>
                  <Link to={`/stock/${s.symbol}`} className="btn btn-sm btn-primary">Trade</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

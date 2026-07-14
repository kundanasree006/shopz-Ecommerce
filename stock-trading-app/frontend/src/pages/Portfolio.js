import { useEffect, useState } from "react";
import api from "../api/axios";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/portfolio");
      setPortfolio(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!portfolio) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>My Portfolio</h2>

      <div className="row mt-3 mb-4">
        <div className="col-md-3">
          <div className="card text-bg-primary"><div className="card-body">
            <h6>Cash Balance</h6>
            <h4>${portfolio.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
          </div></div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-secondary"><div className="card-body">
            <h6>Invested</h6>
            <h4>${portfolio.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
          </div></div>
        </div>
        <div className="col-md-3">
          <div className="card text-bg-dark"><div className="card-body">
            <h6>Current Value</h6>
            <h4>${portfolio.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
          </div></div>
        </div>
        <div className="col-md-3">
          <div className={`card ${portfolio.profitLoss >= 0 ? "text-bg-success" : "text-bg-danger"}`}><div className="card-body">
            <h6>Profit / Loss</h6>
            <h4>${portfolio.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h4>
          </div></div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Avg Buy Price</th>
              <th>Current Price</th>
              <th>Invested</th>
              <th>Current Value</th>
              <th>P/L</th>
              <th>P/L %</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings.map((h) => (
              <tr key={h.symbol}>
                <td className="fw-bold">{h.symbol}</td>
                <td>{h.quantity}</td>
                <td>${h.avgBuyPrice.toFixed(2)}</td>
                <td>${h.currentPrice.toFixed(2)}</td>
                <td>${h.invested.toFixed(2)}</td>
                <td>${h.currentValue.toFixed(2)}</td>
                <td className={h.profitLoss >= 0 ? "text-success" : "text-danger"}>${h.profitLoss.toFixed(2)}</td>
                <td className={h.profitLossPercent >= 0 ? "text-success" : "text-danger"}>{h.profitLossPercent.toFixed(2)}%</td>
              </tr>
            ))}
            {portfolio.holdings.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted">You don't own any stocks yet. Visit the Market to start trading.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;

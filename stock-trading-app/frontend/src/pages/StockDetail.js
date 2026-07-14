import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../api/axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadStock = useCallback(async () => {
    try {
      const res = await api.get(`/stocks/${symbol}`);
      setStock(res.data);
    } catch (err) {
      setError("Stock not found");
    }
  }, [symbol]);

  useEffect(() => {
    loadStock();
    const interval = setInterval(loadStock, 5000); // live chart updates
    return () => clearInterval(interval);
  }, [loadStock]);

  const handleTrade = async (type) => {
    setMessage(null);
    setError(null);
    try {
      const res = await api.post(`/trade/${type}`, { symbol, quantity: Number(quantity) });
      setMessage(res.data.message + ` | New balance: $${res.data.balance.toFixed(2)}`);
    } catch (err) {
      setError(err.response?.data?.message || "Trade failed");
    }
  };

  if (error && !stock) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  if (!stock) return <div className="container mt-4">Loading...</div>;

  const chartData = {
    labels: stock.history.map((_, i) => i + 1),
    datasets: [
      {
        label: `${stock.symbol} price`,
        data: stock.history.map((h) => h.price),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h2>{stock.name} ({stock.symbol})</h2>
      <p className="text-muted">{stock.sector}</p>

      <div className="row">
        <div className="col-md-8">
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h4>${stock.price.toFixed(2)}</h4>
              <p className="mb-1">Day High: ${stock.dayHigh?.toFixed(2)}</p>
              <p className="mb-1">Day Low: ${stock.dayLow?.toFixed(2)}</p>
              <p className="mb-3">Volume: {stock.volume?.toLocaleString()}</p>

              {message && <div className="alert alert-success py-2">{message}</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-success flex-fill" onClick={() => handleTrade("buy")}>Buy</button>
                <button className="btn btn-danger flex-fill" onClick={() => handleTrade("sell")}>Sell</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;

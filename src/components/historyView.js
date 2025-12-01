import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "../styles/historyView.css";
import { getDatabase, ref, onValue, get } from "firebase/database";

const HistoryView = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [points, setPoints] = useState([]);
  const deviceId = "vehiculo1";

  useEffect(() => {
    // Leer fechas disponibles desde la DB (historial/{deviceId})
    const db = getDatabase();
    const histRef = ref(db, `historial/${deviceId}`);
    const unsub = onValue(histRef, (snap) => {
      const val = snap.val() || {};
      const keys = Object.keys(val).sort().reverse();
      setDates(keys);
      if (!selectedDate && keys.length) setSelectedDate(keys[0]);
    });
    return () => unsub();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    const db = getDatabase();
    const dayRef = ref(db, `historial/${deviceId}/${selectedDate}`);
    // leer una vez (get) o onValue para updates en vivo
    get(dayRef).then((snap) => {
      const val = snap.val() || {};
      const arr = Object.values(val)
        .map((p) => [Number(p.lat), Number(p.lng)])
        .filter((x) => !isNaN(x[0]) && !isNaN(x[1]));
      setPoints(arr);
    });
  }, [selectedDate]);

  return (
    <div className="map-container">
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/")}>Volver</button>
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
          {dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <MapContainer center={points[0] || [-32.4828, -58.2368]} zoom={13} className="map">
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <Polyline positions={points} color="green" />
      </MapContainer>
    </div>
  );
};

export default HistoryView;

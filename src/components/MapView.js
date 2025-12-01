import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import "../styles/MapView.css";

import { db } from "../firebaseConfig";
import { ref, onValue, off } from "firebase/database";

import icono from "../assets/icono.png";

const vehicleIcon = new L.Icon({
  iconUrl: icono,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -25],
});

const UpdateMapView = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position);
  }, [position, map]);
  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [info, setInfo] = useState({ lat: null, lng: null, timestamp: null });

  useEffect(() => {
    const deviceId = "vehiculo1";
    const vehiculoRef = ref(db, `datos/${deviceId}`);

    const listener = onValue(vehiculoRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      console.log("DATA OBTENIDA:", data);

      const lat = Number(data.lat);
      const lng = Number(data.lng);
      const timestamp = Number(data.timestamp);

      const newPos = [lat, lng];

      // Actualizar estados
      setCurrentPos(newPos);
      setInfo({ lat, lng, timestamp });
      setPath((prev) => [...prev, newPos]); // Guardamos recorrido
    });

    return () => off(vehiculoRef, "value", listener);
  }, []);

  const formatDate = (ts) => {
    if (!ts) return "Sin datos";
    return new Date(ts).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    });
  };

  return (
    <div className="map-container">
      <div style={{ display: "flex", gap: 8 }}>
        <button className="back-btn" onClick={() => navigate("/")}>
          Salir
        </button>
        <button className="history-btn" onClick={() => navigate("/history")}>
          Ver historial
        </button>
      </div>

      <MapContainer center={[-32.4828, -58.2368]} zoom={15} className="map">
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {currentPos && <UpdateMapView position={currentPos} />}
        {path.length > 1 && <Polyline positions={path} />}

        {currentPos && (
          <Marker position={currentPos} icon={vehicleIcon}>
            <Popup>
              <b>Vehículo 🛰</b> <br />
              Lat: {info.lat.toFixed(6)} <br />
              Lng: {info.lng.toFixed(6)} <br />
              Fecha y hora: {formatDate(info.timestamp)}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="data-panel">
        <p>Latitud: {info.lat}</p>
        <p>Longitud: {info.lng}</p>
        <p>Fecha: {formatDate(info.timestamp)}</p>
      </div>
    </div>
  );
};

export default MapView;

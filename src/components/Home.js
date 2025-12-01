// src/components/MapView.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import "../styles/MapView.css";
import { getDatabase, ref, onValue, off } from "firebase/database";
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

const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // meters
};

const MapView = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState([]);
  const [currentPos, setCurrentPos] = useState([-32.4828, -58.2368]);
  const [info, setInfo] = useState({ lat: 0, lng: 0, timestamp: null, velocidad: 0 });
  // refs to store previous values reliably between updates
  const prevPosRef = useRef(null); // [lat, lng]
  const prevTsRef = useRef(null); // ms

  useEffect(() => {
    const db = getDatabase();

    const vehiculoRef = ref(db, "datos");

    const unsubscribe = onValue(vehiculoRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Datos recibidos desde Firebase:", data);

      let lastData = null;

      if (data && typeof data === "object" && !("lat" in data)) {
        const keys = Object.keys(data);
        const lastKey = keys[keys.length - 1];
        lastData = data[lastKey];
      } else if (data?.lat !== undefined && data?.lng !== undefined) {
        lastData = data;
      }

      // Validar y parsear coordenadas y timestamp
      if (lastData) {
        const lat = parseFloat(lastData.lat);
        const lng = parseFloat(lastData.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          // Normalizar timestamp: acepta segundos o ms
          let fecha = null;
          if (lastData.timestamp !== undefined && lastData.timestamp !== null) {
            const raw = Number(lastData.timestamp);
            if (!isNaN(raw)) {
              const tsMs = raw < 1e12 ? raw * 1000 : raw;
              fecha = new Date(tsMs);
            }
          }

          // Calcular velocidad usando prevPosRef y prevTsRef
          let velocidad = 0;
          const newPos = [lat, lng];

          if (prevPosRef.current && prevTsRef.current && fecha) {
            const [prevLat, prevLng] = prevPosRef.current;
            const prevTsMs = prevTsRef.current;
            const currTsMs = fecha.getTime();

            const dt = (currTsMs - prevTsMs) / 1000; // segundos
            if (dt > 0) {
              const distMeters = haversineDistanceMeters(prevLat, prevLng, lat, lng);
              velocidad = (distMeters / dt) * 3.6; // m/s -> km/h
            }
          }

          // Actualizar prev refs antes de setState final
          prevPosRef.current = newPos;
          if (fecha) prevTsRef.current = fecha.getTime();

          // Guardar en estado
          setCurrentPos(newPos);
          setPath((prev) => {
            // evitar duplicar el mismo punto si ya está al final
            const last = prev[prev.length - 1];
            if (last && last[0] === newPos[0] && last[1] === newPos[1]) return prev;
            return [...prev, newPos];
          });
          setInfo({ lat, lng, timestamp: fecha, velocidad });
          console.log("Procesado:", { lat, lng, fecha, velocidad });
        }
      }
    });

    return () => off(vehiculoRef);
  }, []);

  const formatDate = (fecha) => {
    if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) return "Sin datos";
    return fecha.toLocaleString("es-AR", {
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
        <button
          className="history-btn"
          onClick={() => {
            navigate("/history");
          }}
        >
          Ver historial
        </button>
      </div>

      <MapContainer center={currentPos} zoom={15} className="map">
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <UpdateMapView position={currentPos} />
        <Polyline positions={path} color="blue" />

        {info.lat !== 0 && info.lng !== 0 && (
          <Marker position={currentPos} icon={vehicleIcon}>
            <Popup>
              <b>Vehículo en movimiento</b>
              <br />
              Latitud: {info.lat.toFixed(6)} <br />
              Longitud: {info.lng.toFixed(6)} <br />
              Velocidad: {info.velocidad ? info.velocidad.toFixed(2) : "0.00"} km/h <br />
              Fecha y hora: {formatDate(info.timestamp)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;

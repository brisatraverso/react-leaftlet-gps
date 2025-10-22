import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import "../styles/MapView.css";

// Importar icono personalizado
import icono from "../assets/icono.png";

// Crear el ícono Leaflet
const vehicleIcon = new L.Icon({
  iconUrl: icono,
  iconSize: [30, 30],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const MapView = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState([]);
  const [currentPos, setCurrentPos] = useState([-32.4828, -58.2368]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPos((prev) => {
        const latOffset = (Math.random() - 0.5) * 0.001;
        const lngOffset = (Math.random() - 0.5) * 0.001;
        return [prev[0] + latOffset, prev[1] + lngOffset];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Este segundo efecto se encarga de ir guardando las posiciones en el path
  useEffect(() => {
    setPath((prevPath) => [...prevPath, currentPos]);
  }, [currentPos]);

  return (
    <div className="map-container">
      <button className="back-btn" onClick={() => navigate("/")}>
        Volver
      </button>

      <MapContainer center={currentPos} zoom={15} className="map">
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Polyline positions={path} color="blue" />
        <Marker position={currentPos} icon={vehicleIcon}>
          <Popup>Vehículo en movimiento</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;

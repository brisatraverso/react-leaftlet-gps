import React from "react";
import L from "leaflet";

export const IconLocation = L.icon ({
    iconUrl: require('../assets/icono.png'),
    iconRetinaUrl: require('../assets/icono.png'),
    iconAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowRetinaUrl: null,
    iconSize: [35, 35],
    className: "leaflet-venue-icon",
});

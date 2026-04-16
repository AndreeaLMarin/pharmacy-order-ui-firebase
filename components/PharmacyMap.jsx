// components/PharmacyMap.jsx
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    background: #0284c7;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(45deg);
      color: white;
      font-size: 16px;
    ">+</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function PharmacyMap({ pharmacies, onPharmacyClick, selectedPharmacyId }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([50.9097, -1.4044], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    pharmacies.forEach((pharmacy) => {
      const marker = L.marker(
        [parseFloat(pharmacy.lat), parseFloat(pharmacy.lng)],
        { icon: customIcon }
      ).addTo(map);

      const popupContent = `
        <div style="min-width:200px">
          <h3 style="font-weight:600;margin-bottom:8px">${pharmacy.name}</h3>
          <p style="font-size:13px;color:#666;margin-bottom:4px">${pharmacy.address}</p>
          <p style="font-size:13px;color:#666;margin-bottom:8px">${pharmacy.phone}</p>
          <p style="font-size:13px;color:${pharmacy.isOpen ? "#16a34a" : "#dc2626"};font-weight:500">
            ${pharmacy.isOpen ? "● Open Now" : "● Closed"}
          </p>
          <a href="/pharmacies/${pharmacy.id}" 
            style="display:block;margin-top:8px;background:#0284c7;color:white;text-align:center;padding:6px;border-radius:4px;text-decoration:none;font-size:13px">
            View Products
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        if (onPharmacyClick) onPharmacyClick(pharmacy);
      });

      if (selectedPharmacyId === pharmacy.id) {
        marker.openPopup();
      }
    });

    if (pharmacies.length > 0) {
      const bounds = L.latLngBounds(
        pharmacies.map((p) => [parseFloat(p.lat), parseFloat(p.lng)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pharmacies, onPharmacyClick, selectedPharmacyId]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
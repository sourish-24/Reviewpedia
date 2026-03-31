import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import * as h3 from 'h3-js';

import { MapPin, Info, RefreshCw } from 'lucide-react';

const DEFAULT_CENTER = [28.7041, 77.1025]; // New Delhi as fallback

export default function AppMap({ onReviewSelect, searchQuery, mapUpdateTrigger, viewMode }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const hexagonsLayer = useRef(null);
  const markersLayer = useRef(null);
  
  const [userLocation, setUserLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState("Waiting for location access...");

  useEffect(() => {
    // 1. Initialize empty map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Listen to zoom to update clusters
      mapInstance.current.on('zoomend', updateLayout);
      mapInstance.current.on('moveend', updateLayout);
    }

    // 2. Request Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          mapInstance.current.setView(loc, 12);
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
          setLoadingMsg("Location denied. Showing default area.");
          const loc = DEFAULT_CENTER;
          setUserLocation(loc);
          mapInstance.current.setView(loc, 12);
        }
      );
    } else {
      setLoadingMsg("Geolocation not supported by browser.");
      const loc = DEFAULT_CENTER;
      setUserLocation(loc);
      mapInstance.current.setView(loc, 12);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('zoomend');
        mapInstance.current.off('moveend');
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      initData(userLocation[0], userLocation[1]);
    }
  }, [searchQuery, mapUpdateTrigger, userLocation]);

  const initData = async (lat, lng) => {
    try {
      setLoadingMsg("Fetching reviews...");
      let url = '/api/reviews';
      if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      setReviews(data);
      setLoadingMsg(null);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoadingMsg("Error loading reviews.");
    }
  };

  useEffect(() => {
    if (reviews.length >= 0 && mapInstance.current) {
      updateLayout();
    }
  }, [reviews, viewMode]);

  const updateLayout = () => {
    if (!mapInstance.current) return;

    if (hexagonsLayer.current) {
      mapInstance.current.removeLayer(hexagonsLayer.current);
    }
    if (markersLayer.current) {
      mapInstance.current.removeLayer(markersLayer.current);
    }

    hexagonsLayer.current = L.featureGroup().addTo(mapInstance.current);
    markersLayer.current = L.featureGroup().addTo(mapInstance.current);

    if (reviews.length === 0) return;

    const zoom = mapInstance.current.getZoom();

    // Consumer Mode: Standard Markers Grouped by Location
    if (viewMode === 'consumer') {
       const grouped = {};
       reviews.forEach(review => {
           // simple grouping by 4 decimal places roughly 10 meters bounds
           const key = `${review.lat.toFixed(4)},${review.lng.toFixed(4)}`;
           if(!grouped[key]) grouped[key] = [];
           grouped[key].push(review);
       });
       
       Object.values(grouped).forEach(cluster => {
           const size = cluster.length > 9 ? 34 : 28;
           const icon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: var(--primary); width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${cluster.length > 9 ? 11 : 12}px">${cluster.length}</div>`,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2]
           });
           const marker = L.marker([cluster[0].lat, cluster[0].lng], { icon });
           marker.on('click', () => onReviewSelect(cluster)); // Pass array of reviews to App for UI
           markersLayer.current.addLayer(marker);
       });
       return; // Skip H3 logic entirely
    }
    
    // Business Mode: H3 Hexagonal Density
    if (viewMode === 'business') {
        let resolution = 6;
        if (zoom >= 15) resolution = 10;
        else if (zoom >= 13) resolution = 8;
        else if (zoom >= 11) resolution = 7;

        const h3Counts = {};

        reviews.forEach(review => {
            const h3Index = h3.latLngToCell(review.lat, review.lng, resolution);
            h3Counts[h3Index] = (h3Counts[h3Index] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(h3Counts), 1);

        if (zoom >= 16) {
             // Let it fallback to markers visually inside hexagons if they zoom deeply 
             // in business mode too for precision analysis
             reviews.forEach(review => {
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: #8b5cf6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });
                const marker = L.marker([review.lat, review.lng], { icon }).bindTooltip(review.productName);
                marker.on('click', () => onReviewSelect(review)); // Legacy fallback for business mode clicking single review
                markersLayer.current.addLayer(marker);
            });
            return;
        }

        Object.keys(h3Counts).forEach(h3Index => {
            const count = h3Counts[h3Index];
            const intensity = count / maxCount;

            const boundary = h3.cellToBoundary(h3Index);
            
            const polygon = L.polygon(boundary, {
                color: '#8b5cf6', // distinction color for business mode
                weight: 1,
                fillColor: `rgba(139, 92, 246, ${0.2 + (0.6 * intensity)})`,
                fillOpacity: 0.6 + (0.3 * intensity)
            });

            polygon.bindTooltip(`Density: ${count} Reviews`);
            polygon.on('click', () => {
                mapInstance.current.setView(polygon.getBounds().getCenter(), zoom + 2);
            });

            hexagonsLayer.current.addLayer(polygon);
        });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loadingMsg && (
        <div style={{ 
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', 
          zIndex: 9999, background: 'var(--panel-bg)', padding: '10px 20px',
          borderRadius: 20, backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)',
          display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--glass-border)',
          fontWeight: 500, color: 'var(--primary-color)'
        }}>
          <RefreshCw className="animate-spin" size={18} />
          {loadingMsg}
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

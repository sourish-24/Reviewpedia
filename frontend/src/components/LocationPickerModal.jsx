import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';

export default function LocationPickerModal({ onClose, onConfirm, initialLocation }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const [selectedPos, setSelectedPos] = useState(initialLocation || { lat: 28.7041, lng: 77.1025 });

    useEffect(() => {
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                center: [selectedPos.lat, selectedPos.lng],
                zoom: 13,
                zoomControl: false,
            });

            L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap contributors',
                maxZoom: 20
            }).addTo(mapInstance.current);

            L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

            // Custom Marker Icon
            const icon = L.divIcon({
                className: 'custom-pin-marker',
                html: `<div style="color: var(--primary); display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(-50%);">
                         <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                           <circle cx="12" cy="10" r="3" fill="white"></circle>
                         </svg>
                       </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36] // Point of the icon which will correspond to marker's location
            });

            markerRef.current = L.marker([selectedPos.lat, selectedPos.lng], { 
                icon,
                draggable: true 
            }).addTo(mapInstance.current);

            markerRef.current.on('dragend', function (e) {
                const pos = markerRef.current.getLatLng();
                setSelectedPos({ lat: pos.lat, lng: pos.lng });
            });

            mapInstance.current.on('click', function(e) {
                const { lat, lng } = e.latlng;
                setSelectedPos({ lat, lng });
                markerRef.current.setLatLng([lat, lng]);
            });
            
            // Try to get actual location if no initial location provided
            if (!initialLocation && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const { latitude, longitude } = pos.coords;
                    setSelectedPos({ lat: latitude, lng: longitude });
                    if (markerRef.current) {
                        markerRef.current.setLatLng([latitude, longitude]);
                    }
                    if (mapInstance.current) {
                        mapInstance.current.setView([latitude, longitude], 13);
                    }
                }, () => {}, { timeout: 10000 });
            }
        }
        
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    const handleConfirm = () => {
        onConfirm(selectedPos);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--surface)', width: '90%', maxWidth: '600px', height: '70vh', borderRadius: '16px', border: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-lowest)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', color: 'var(--on-surface)' }}>
                        Choose Location
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
                    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-highest)', color: 'var(--on-surface)', padding: '8px 16px', borderRadius: '9999px', fontSize: '0.85rem', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none', border: '1px solid var(--outline-variant)' }}>
                        Drag the pin or click on the map
                    </div>
                </div>
                
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'var(--surface-lowest)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                            Cancel
                        </button>
                        <button onClick={handleConfirm} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                            Share Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

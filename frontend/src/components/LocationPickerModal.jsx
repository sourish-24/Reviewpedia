import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import { X, Crosshair } from 'lucide-react';

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
                html: `<div style="color: #0ea5e9; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(-50%);">
                         <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="#0ea5e9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                           <circle cx="12" cy="10" r="3" fill="white"></circle>
                         </svg>
                       </div>`,
                iconSize: [38, 38],
                iconAnchor: [19, 38]
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
            
            if (!initialLocation && navigator.geolocation) {
                setTimeout(() => {
                    handleLocateMe(true);
                }, 100);
            }
        }
        
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    const handleLocateMe = (silent = false) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setSelectedPos({ lat: latitude, lng: longitude });
                if (markerRef.current) {
                    markerRef.current.setLatLng([latitude, longitude]);
                }
                if (mapInstance.current) {
                    mapInstance.current.setView([latitude, longitude], 15);
                }
            }, (err) => {
                if (!silent) {
                    alert("Could not get your location: " + err.message);
                }
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        } else if (!silent) {
            alert("Geolocation is not supported by your browser");
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedPos);
    };

    return ReactDOM.createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', zIndex: 10000000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ background: '#161E2E', width: '100%', maxWidth: '640px', height: '72vh', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', color: '#ffffff', fontFamily: 'var(--font-body)' }}>
                {/* Header Row without Icon beside Choose Location */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161E2E' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                        Choose Location
                    </h3>
                    <button 
                      onClick={onClose} 
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', padding: 0, transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                    >
                        <X size={18} />
                    </button>
                </div>
                
                {/* Map Area */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
                    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(22, 30, 46, 0.9)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '8px 20px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 500, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', pointerEvents: 'none', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                        Drag the pin or click on the map
                    </div>

                    {/* Locate Me Overlay Button */}
                    <button 
                        onClick={handleLocateMe}
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            left: 20,
                            zIndex: 1000,
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: '#161E2E',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#28303E'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#161E2E'}
                        title="Locate Me"
                    >
                        <Crosshair size={20} color="#ffffff" />
                    </button>
                </div>
                
                {/* Footer Controls */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161E2E' }}>
                    <button 
                      onClick={onClose} 
                      style={{ background: '#161E2E', border: 'none', color: '#ffffff', padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#0ea5e9'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}
                    >
                        Cancel
                    </button>
                    <button 
                      onClick={handleConfirm} 
                      style={{ background: '#0ea5e9', border: 'none', color: '#ffffff', padding: '10px 24px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                    >
                        Share Location
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import * as h3 from 'h3-js';

import { MapPin, Info, RefreshCw, Crosshair, X } from 'lucide-react';

const DEFAULT_CENTER = [28.7041, 77.1025]; // New Delhi as fallback

const AppMap = forwardRef(({ onReviewSelect, searchQuery, mapUpdateTrigger, viewMode, currentUser, hexResolution }, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const hexagonsLayer = useRef(null);
  const markersLayer = useRef(null);
  const userDotLayer = useRef(null);
  
  const [userLocation, setUserLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState("Waiting for location access...");
  
  const [selectedHexagon, setSelectedHexagon] = useState(null);
  const [hexSummary, setHexSummary] = useState(null);
  const [hexLoading, setHexLoading] = useState(false);

  const reviewsRef = useRef([]);
  const viewModeRef = useRef(viewMode);
  const userLocationRef = useRef(null);
  const showUserDotRef = useRef(false);
  const hexResolutionRef = useRef(hexResolution);

  useEffect(() => { reviewsRef.current = reviews; }, [reviews]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);
  useEffect(() => { hexResolutionRef.current = hexResolution; updateLayout(); }, [hexResolution]);

  useEffect(() => {
    // 1. Initialize empty map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
      });

      L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap contributors',
        maxZoom: 20
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Listen to zoom to update clusters
      mapInstance.current.on('zoomend', () => {
         updateLayout();
         saveMapState();
      });
      mapInstance.current.on('moveend', () => {
         updateLayout();
         saveMapState();
      });

      const saveMapState = () => {
         if (!mapInstance.current) return;
         const center = mapInstance.current.getCenter();
         const zoom = mapInstance.current.getZoom();
         sessionStorage.setItem('mapState', JSON.stringify({ lat: center.lat, lng: center.lng, zoom }));
      };
    }

    // 2. Request Geolocation or Restore State
    const storedStateStr = sessionStorage.getItem('mapState');
    const storedUserLocStr = sessionStorage.getItem('userLoc');

    if (storedStateStr) {
      const state = JSON.parse(storedStateStr);
      if (storedUserLocStr) setUserLocation(JSON.parse(storedUserLocStr));
      else setUserLocation([state.lat, state.lng]);
      
      mapInstance.current.setView([state.lat, state.lng], state.zoom);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          sessionStorage.setItem('userLoc', JSON.stringify(loc));
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

  useImperativeHandle(ref, () => ({
    locateUser
  }));

  const locateUser = () => {
    if (navigator.geolocation) {
      setLoadingMsg("Locating...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          sessionStorage.setItem('userLoc', JSON.stringify(loc));
          showUserDotRef.current = true;
          if (mapInstance.current) {
             mapInstance.current.flyTo(loc, 14);
             updateLayout();
          }
          setLoadingMsg(null);
          setTimeout(() => {
              showUserDotRef.current = false;
              updateLayout();
          }, 10000);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLoadingMsg("Location denied or unavailable.");
          setTimeout(() => setLoadingMsg(null), 2000);
        }
      );
    }
  };

  useEffect(() => {
    if (userLocation) {
      initData(userLocation[0], userLocation[1]);
    }
  }, [searchQuery, mapUpdateTrigger, userLocation]);

  const initData = async (lat, lng) => {
    try {
      setLoadingMsg("Fetching reviews...");
      const API_URL = import.meta.env.VITE_API_URL || '';
      let url = `${API_URL}/api/reviews`;
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

  const fetchHexagonSummary = async (hexReviews) => {
      setHexLoading(true);
      setHexSummary(null);
      try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const res = await fetch(`${API_URL}/api/agents/hexagon-summary`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reviews: hexReviews.map(r => ({ rating: r.review?.rating, text: r.review?.text || r.review?.title })) })
          });
          const data = await res.json();
          if (data.success) setHexSummary(data.result);
          else setHexSummary("Failed to generate AI summary.");
      } catch (err) {
          setHexSummary("Network error generating summary.");
      } finally {
          setHexLoading(false);
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
    if (userDotLayer.current) {
      mapInstance.current.removeLayer(userDotLayer.current);
    }

    hexagonsLayer.current = L.featureGroup().addTo(mapInstance.current);
    markersLayer.current = L.featureGroup().addTo(mapInstance.current);
    userDotLayer.current = L.featureGroup().addTo(mapInstance.current);

    // Plot User Location Dot
    if (showUserDotRef.current && userLocationRef.current) {
        const userIcon = L.divIcon({
            className: 'user-dot-marker',
            html: `<div style="background-color: var(--primary); width: 16px; height: 16px; border-radius: 50%; border: 1px solid white; box-shadow: 0 0 10px rgba(81, 56, 214, 0.5);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        const userMarker = L.marker(userLocationRef.current, { icon: userIcon, zIndexOffset: 1000 }).bindTooltip("You are here");
        userDotLayer.current.addLayer(userMarker);
    }

    const currentReviews = reviewsRef.current;
    if (currentReviews.length === 0) return;

    const zoom = mapInstance.current.getZoom();
    const currentViewMode = viewModeRef.current;

    // Consumer Mode: Standard Markers Grouped by Location
    if (currentViewMode === 'consumer') {
       const groups = {};
       currentReviews.forEach(r => {
         const idx = r.location?.h3Index;
         if (!idx) return;
         if (!groups[idx]) {
           groups[idx] = [];
         }
         groups[idx].push(r);
       });
       
       Object.values(groups).forEach(cluster => {
           const centerLat = cluster[0].location?.lat;
           const centerLng = cluster[0].location?.lng;
           if (!centerLat || !centerLng) return;

           const bgColor = 'var(--primary)'; // Standardized indigo
           const size = cluster.length > 9 ? 26 : 22;
           const icon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 1px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${cluster.length > 9 ? 10 : 11}px">${cluster.length}</div>`,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2]
           });
           const marker = L.marker([centerLat, centerLng], { icon });
           marker.on('click', () => onReviewSelect(cluster)); // Pass array of reviews to App for UI
           markersLayer.current.addLayer(marker);
       });
       return; // Skip H3 logic entirely
    }
    
    // Business Mode: H3 Hexagonal Density
    if (currentViewMode === 'business') {
        let resolution = hexResolutionRef.current;

        const h3Counts = {};

        currentReviews.forEach(review => {
            // Force dynamic recalculation of h3Index based on the slider instead of the static database index
            const h3Index = h3.latLngToCell(review.location.lat, review.location.lng, resolution);
            h3Counts[h3Index] = (h3Counts[h3Index] || 0) + 1;
        });

        const maxCount = Math.max(...Object.values(h3Counts), 1);

        // We removed the marker fallback so the resolution slider is strictly honored at all zoom levels.

        Object.keys(h3Counts).forEach(h3Index => {
            const count = h3Counts[h3Index];
            const intensity = count / maxCount;

            const boundary = h3.cellToBoundary(h3Index);
            
            const polygon = L.polygon(boundary, {
                color: '#5138d6', // distinction color for business mode
                weight: 1,
                fillColor: `rgba(81, 56, 214, ${0.2 + (0.6 * intensity)})`,
                fillOpacity: 0.6 + (0.3 * intensity)
            });

            polygon.bindTooltip(`Density: ${count} Reviews`);
            polygon.on('click', () => {
                const hexReviews = currentReviews.filter(r => h3.latLngToCell(r.location.lat, r.location.lng, resolution) === h3Index);
                
                const ratings = hexReviews.map(r => r.review?.rating || 0).filter(r => r > 0);
                const avgRating = ratings.length > 0 ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : 'N/A';
                const maxRating = ratings.length > 0 ? Math.max(...ratings) : 'N/A';
                const minRating = ratings.length > 0 ? Math.min(...ratings) : 'N/A';

                setSelectedHexagon({
                    id: h3Index,
                    count,
                    avgRating,
                    maxRating,
                    minRating
                });
                
                mapInstance.current.flyTo(polygon.getBounds().getCenter(), zoom + 1);
                fetchHexagonSummary(hexReviews);
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
      


      {/* Hexagon Side Panel */}
      {viewMode === 'business' && selectedHexagon && (
        <div className="glass-panel" style={{
            position: 'absolute', top: 100, right: 30, width: '380px', zIndex: 1000, 
            background: 'var(--surface-lowest)', borderRadius: '16px', border: '1px solid var(--outline-variant)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
            maxHeight: '80vh', overflowY: 'auto'
        }}>
            <button onClick={() => setSelectedHexagon(null)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                <X size={20} />
            </button>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--on-surface)' }}>Hexagon Cluster</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Region ID: {selectedHexagon.id}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="tonal-panel" style={{ padding: '12px', background: 'var(--surface-highest)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reviews</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedHexagon.count}</div>
                </div>
                <div className="tonal-panel" style={{ padding: '12px', background: 'var(--surface-highest)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Rating</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--golden-star)' }}>{selectedHexagon.avgRating} <span style={{fontSize:'1rem'}}>★</span></div>
                </div>
                <div className="tonal-panel" style={{ padding: '12px', background: 'var(--surface-highest)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worst Rating</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>{selectedHexagon.minRating} <span style={{fontSize:'0.8rem'}}>★</span></div>
                </div>
                <div className="tonal-panel" style={{ padding: '12px', background: 'var(--surface-highest)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Rating</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>{selectedHexagon.maxRating} <span style={{fontSize:'0.8rem'}}>★</span></div>
                </div>
            </div>

            <div style={{ marginTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--on-surface)' }}>AI Sentimental Summary</h4>
                <div className="tonal-panel" style={{ padding: '16px', background: 'var(--surface-highest)', minHeight: '100px', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--on-surface)' }}>
                    {hexLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <RefreshCw className="animate-spin" size={16} /> Analyzing local sentiment...
                        </div>
                    ) : (
                        hexSummary || "No summary available."
                    )}
                </div>
            </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
});

export default AppMap;

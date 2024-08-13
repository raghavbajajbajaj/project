import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pointa from './pointa.jpg';
import pointb from './pointb.jpg'; 
import arrow from './arrow.png'; 

const START_COORDS = [22.1696, 91.4996]; // Starting coordinates (latitude, longitude)
const END_COORDS = [22.2637, 91.7159];   // Ending coordinates (latitude, longitude)
const SPEED_KMPH = 1000; // Speed in km/h
const REFRESH_RATE_MS = 50; // Refresh rate in milliseconds

const App = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Initialize the map with zoom level 11 for a slightly zoomed-out view
    const mapInstance = L.map('map').setView(START_COORDS, 11);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);

    // Create custom icons
    const startIcon = L.icon({
      iconUrl: pointa,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const endIcon = L.icon({
      iconUrl: pointb,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Add markers with custom icons
    const startMarker = L.marker(START_COORDS, { icon: startIcon }).addTo(mapInstance);
    startMarker.bindPopup('<b>A</b>').openPopup();

    const endMarker = L.marker(END_COORDS, { icon: endIcon }).addTo(mapInstance);
    endMarker.bindPopup('<b>B</b>').openPopup();


    // Set map instance to state
    setMap(mapInstance);

    // Cleanup function to remove the map on component unmount
    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (map) {
      // Initialize the moving image
      const movingIcon = L.divIcon({
        className: 'rotated-arrow',
        html: `<img src="${arrow}" style="width: 32px; height: 32px;" />`,
        iconSize: [32, 32],
        iconAnchor: [16, 16], // Center the anchor point
      });

      const movingMarker = L.marker(START_COORDS, { icon: movingIcon }).addTo(map);

      // Calculate the total distance and movement parameters
      const start = L.latLng(START_COORDS);
      const end = L.latLng(END_COORDS);
      const totalDistance = start.distanceTo(end); // in meters
      const speed = SPEED_KMPH * 1000 / 3600; // Convert speed to meters per second
      const duration = totalDistance / speed; // Total time required in seconds

      const stepDistance = (speed * (REFRESH_RATE_MS / 1000)); // Distance moved in each refresh (meters)
      const totalSteps = Math.ceil(totalDistance / stepDistance); // Total number of steps

      // Calculate the direction vector and heading angle
      const latLngsVector = L.latLng(end.lat - start.lat, end.lng - start.lng);
      const headingAngle = Math.atan2(latLngsVector.lng, latLngsVector.lat) * (180 / Math.PI); // Angle in degrees

      let currentStep = 0;

      const updatePosition = () => {
        if (currentStep >= totalSteps) {
          movingMarker.setLatLng(END_COORDS);
          return; // Stop updating after reaching the end
        }

        // Calculate new position based on step
        const progress = currentStep / totalSteps;
        const lat = START_COORDS[0] + latLngsVector.lat * progress;
        const lng = START_COORDS[1] + latLngsVector.lng * progress;
        movingMarker.setLatLng([lat, lng]);

        // Set rotation of the arrow
        const rotation = headingAngle - 90; // Adjust by 90 degrees to align with the direction
        movingMarker.setIcon(
          L.divIcon({
            className: 'rotated-arrow',
            html: `<img src="${arrow}" style="transform: rotate(${rotation}deg); width: 32px; height: 32px;" />`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
        );

        currentStep++;
        setTimeout(updatePosition, REFRESH_RATE_MS); // Continue updating
      };

      // Start the animation
      updatePosition();
    }
  }, [map]);

  return (
    <div>
      <div id="map" style={{ height: '100vh', width: '100%' }}></div>
      <div style={{
        textAlign: 'center',
        padding: '20px',
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        Start Coordinates: [22.1696, 91.4996] <br />
        End Coordinates: [22.2637, 91.7159] <br />
        Speed: 1000 km/h <br />
        Refresh Rate: 50 ms
      </div>
    </div>
  );
};

export default App;

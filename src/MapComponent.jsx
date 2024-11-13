import React, { useEffect, useRef, useState } from 'react';
import './MapComponent.css';
import { Map, View, Overlay } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

const MapComponent = ({ employeeId, selectedPackage, searchLocationCoords, searchLocationName }) => {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState('');

  // Function to get coordinates from location name (geocoding)
  const getCoordinatesFromLocationName = async (locationName) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${locationName}&format=json&limit=1`);
      const data = await response.json();
      if (data && data[0]) {
        const { lat, lon } = data[0]; // Extract lat and lon from the first result
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      }
      return null; // If no result, return null
    } catch (error) {
      console.error('Error fetching location coordinates:', error);
      return null;
    }
  };

  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      }),
      className: 'ol-icon',
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: [], // Remove the attribution text
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([79.0373, 15.5281]),
        zoom: 7,
      }),
    });

    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    initialMap.addOverlay(overlay);

    // Function to fetch employee data
    const fetchEmployeeData = async () => {
      try {
        const defaultPackageId = 'default';
        const packageToUse = selectedPackage === "all" ? defaultPackageId : selectedPackage;

        const response = await fetch(`http://68.183.86.1:8080/trackagile/dashboard/locations/${packageToUse}`);
        const result = await response.json();

        if (result && Array.isArray(result.data)) {
          const employeeData = result.data;
          vectorSource.clear(); // Clear existing features

          for (const employee of employeeData) {
            const { empName, logInTime, logoutTime, status, lastLocX, lastLocY } = employee;
            if (lastLocX !== null && lastLocY !== null) {
              const employeeLocation = fromLonLat([lastLocY, lastLocX]); // Correct order for latitude and longitude

              const employeeFeature = new Feature({
                geometry: new Point(employeeLocation),
              });
              employeeFeature.set('employeeData', { empName, logInTime, logoutTime, status, lastLocX, lastLocY });
              vectorSource.addFeature(employeeFeature);
            }
          }
        } else {
          console.error('API response format is not as expected:', result);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    // Fetch employee data initially and every 10 minutes
    fetchEmployeeData();
    const intervalId = setInterval(fetchEmployeeData, 600000);

    // Get user's current geolocation without re-centering the map
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = fromLonLat([longitude, latitude]); // Correct order: [longitude, latitude]

        const userFeature = new Feature(new Point(userLocation));
        vectorSource.addFeature(userFeature);
      },
      (error) => {
        console.error('Error occurred while retrieving location:', error);
      }
    );

    // Handling map click to display employee details in the popup
    initialMap.on('click', async (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const employeeData = feature.get('employeeData');
        if (employeeData) {
          const { empName, logInTime, logoutTime, status, lastLocX, lastLocY } = employeeData;

          // Fetch location name
          const getLocationName = async (lat, lon) => {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const data = await response.json();
          return data.display_name || 'Unknown Location';
        };

          const employeePresentLocationName = await getLocationName(lastLocX, lastLocY);

          console.log(employeePresentLocationName);

          setPopupContent(
            `<div class="popup-content">` +
            `<center><h5 style="color: white; background-color: #3f51b1; border-radius: 25px; ">${empName}</h5></center>` + // Employee name in blue
            `<div class="popup-row"><span class="popup-label">Log In Time</span><span class="popup-colon">:</span><span class="popup-value">${logInTime || 'N/A'}</span></div>` +
            `<div class="popup-row"><span class="popup-label">Log Out Time</span><span class="popup-colon">:</span><span class="popup-value">${logoutTime || 'N/A'}</span></div>` +
            `<div class="popup-row"><span class="popup-label">Status</span><span class="popup-colon">:</span><span class="popup-value">${status}</span></div>` +
            `<div class="popup-row"><span class="popup-label">Location</span><span class="popup-colon">:</span><span class="popup-value">${employeePresentLocationName}</span></div>` +
            `</div>`
          );

          // Delay for a moment to ensure content is rendered before showing the popup
          setTimeout(() => {
            const coordinates = feature.getGeometry().getCoordinates();
            overlay.setPosition(coordinates);
          }, 10); // Small delay to allow popup content to render before showing
        } else {
          overlay.setPosition(undefined); // Hide the popup if no feature data
        }
      } else {
        overlay.setPosition(undefined); // Hide the popup if no feature is clicked
      }
    });

    // Center map on specific employee if `employeeId` is provided
    if (employeeId) {
      const employeeFeature = vectorSource.getFeatures().find(f => f.get('employeeData')?.id === employeeId);
      if (employeeFeature) {
        const coordinates = employeeFeature.getGeometry().getCoordinates();
        initialMap.getView().setCenter(coordinates);
        initialMap.getView().setZoom(14);
      }
    }

    // Zoom to the search location if `searchLocationCoords` is provided
    if (Array.isArray(searchLocationCoords) && searchLocationCoords.length === 2) {
      const [longitude, latitude] = searchLocationCoords;
      const searchLocation = fromLonLat([longitude, latitude]);
      initialMap.getView().setCenter(searchLocation);
      initialMap.getView().setZoom(12); // Adjust zoom level as needed
    }

    // Zoom to location by name if `searchLocationName` is provided
    if (searchLocationName) {
      getCoordinatesFromLocationName(searchLocationName).then((coords) => {
        if (coords) {
          const { lat, lon } = coords;
          const location = fromLonLat([lon, lat]);
          initialMap.getView().setCenter(location);
          initialMap.getView().setZoom(12); // Adjust zoom level as needed
        } else {
          console.error('Location not found:', searchLocationName);
        }
      });
    }

    return () => {
      clearInterval(intervalId);
      initialMap.setTarget(null);
    };
  }, [employeeId, selectedPackage, searchLocationCoords, searchLocationName]);

  return (
    <>
      <div ref={mapRef} className="map-container"></div>
      <div ref={popupRef} id="popup" className="ol-popup">
        <div id="popup-content" dangerouslySetInnerHTML={{ __html: popupContent }}></div>
      </div>
    </>
  );
};

export default MapComponent;

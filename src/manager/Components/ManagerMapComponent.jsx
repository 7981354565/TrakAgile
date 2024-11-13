import React, { useEffect, useRef, useState } from 'react';
import '../Css/ManagerMapComponent.css';
import { Map, View, Overlay } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

const ManagerMapComponent = ({ employeeId, selectedPackage }) => {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState('');

  // Function to get location name from latitude and longitude
  const getLocationName = async (lat, lon) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await response.json();
    return data.display_name || 'Unknown Location';
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
        center: fromLonLat([78.0373, 15.8281]), // Center the map to Kurnool by default
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

    const fetchEmployeeData = async () => {
      try {
        // Log the selected package
        console.log('Selected Package:', selectedPackage);
    
        // Define a default package ID
        const defaultPackageId = 'default'; // Replace with your actual default package ID
    
        // If selected package is "all", change it to "default"
        const packageToUse = selectedPackage === "all" ? defaultPackageId : selectedPackage;
    
        // Fetch employee data with the selected or default package
        const response = await fetch(`http://68.183.86.1:8080/trackagile/dashboard/locations/${packageToUse}`);
        const result = await response.json();
        console.log('API response:', result);
    
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
          const locationName = await getLocationName(lastLocX, lastLocY);
        
          setPopupContent(
            `<div class="popup-content">` +
            `<center><h5 style="color: white; background-color: #3f51b1; border-radius: 25px; ">${empName}</h5></center>` + // Employee name in blue
            `<div class="popup-row"><span class="popup-label">Log In Time</span><span class="popup-colon">:</span><span class="popup-value">${logInTime || 'N/A'}</span></div>` +
            `<div class="popup-row"><span class="popup-label">Log Out Time</span><span class="popup-colon">:</span><span class="popup-value">${logoutTime || 'N/A'}</span></div>` +
            `<div class="popup-row"><span class="popup-label">Status</span><span class="popup-colon">:</span><span class="popup-value">${status}</span></div>` +
            `<div class="popup-row"><span class="popup-label">Location</span><span class="popup-colon">:</span><span class="popup-value">${locationName}</span></div>` +
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

    return () => {
      clearInterval(intervalId);
      initialMap.setTarget(null);
    };
  }, [employeeId, selectedPackage]); // Add selectedPackage to dependencies

  return (
    <>
      <div ref={mapRef} className="map-container"></div>
      <div ref={popupRef} id="popup" className="ol-popup">
        <div id="popup-content" dangerouslySetInnerHTML={{ __html: popupContent }}></div>
      </div>
    </>
  );
};

export default ManagerMapComponent;

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css'; // Import OpenLayers CSS
import { Map, View } from 'ol'; // OpenLayers components
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import FullScreen from 'ol/control/FullScreen'; 
import { getDistance } from 'ol/sphere'; // Import distance calculation function
import './TravelAttendanceMap.css'; // Custom styles

const TravelAttendenceMap = ({ locations }) => {
  const mapRef = useRef(); // Ref for the map container
  const [totalDistance, setTotalDistance] = useState(0); // State to store total distance

  useEffect(() => {
    if (!locations || locations.length < 2) {
      console.error("Locations data is not available or insufficient");
      return; // Exit if locations are not available
    }

    // Parse the pointWkt string to extract coordinates
    const coordinates = locations.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
    const points = [];
    
    for (let i = 0; i < coordinates.length; i += 2) {
      points.push([coordinates[i + 1], coordinates[i]]); // Switch lat and lon
    }

    // Calculate total distance between consecutive points
    let calculatedDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      calculatedDistance += getDistance(points[i], points[i + 1]);
    }
    setTotalDistance((calculatedDistance / 1000).toFixed(2)); // Convert meters to kilometers

    // Create features for each location
    const features = points.map((point, index) => {
      return new Feature({
        geometry: new Point(fromLonLat(point)),
        name: `Location ${index + 1}`,
        iconColor: index === 0 ? 'green' : index === points.length - 1 ? 'red' : 'blue',
        iconSize: index === 0 || index === points.length - 1 ? 0.05 : 0.03, // Set icon size
      });
    });

    // Create a LineString for the route
    const routeLine = new Feature({
      geometry: new LineString(points.map(pt => fromLonLat(pt))),
    });

    // Set up the vector layer
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [...features, routeLine],
      }),
      style: (feature) => {
        const color = feature.get('iconColor');
        const size = feature.get('iconSize'); // Get icon size for this feature

        return new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: size, // Use the size from the feature
            color: color, // Set icon color based on the feature
          }),
        });
      },
    });

    // Style for the route line (set to red)
    const routeStyle = new Style({
      stroke: new Stroke({
        color: 'red', // Change the color to red
        width: 2,
      }),
    });

    routeLine.setStyle(routeStyle); // Apply style to route line

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(), // OpenStreetMap layer
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat(points[0]),
        zoom: 15,
      }),
    });

    // Fit the map view to the route line
    map.getView().fit(routeLine.getGeometry().getExtent(), {
      maxZoom: 15,
    });

    // Add flags for intermediate locations
    for (let i = 1; i < points.length - 1; i++) {
      const intermediateFeature = new Feature({
        geometry: new Point(fromLonLat(points[i])),
        iconColor: 'blue', // Set color for intermediate points
        iconSize: 0.03, // Set size for intermediate points
      });
      features.push(intermediateFeature); // Add the intermediate feature
    }

    // Refresh the vector layer to include new features
    vectorLayer.setSource(new VectorSource({ features: [...features, routeLine] }));

    // Add fullscreen control
    const fullScreenControl = new FullScreen({
      className: 'ol-full-screen',
      label: '\u2194',
      labelActive: '\u00D7',
      tipLabel: 'Toggle Fullscreen',
    });
    map.addControl(fullScreenControl);

    return () => {
      map.setTarget(null); // Clean up on unmount
    };
  }, [locations]);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '260px' }} /> {/* Map container */}
      <p style={{fontSize: '15px', fontWeight : 'bold'}}>Total Distance: {totalDistance} km</p> {/* Display total distance */}
    </div>
  );
};

export default TravelAttendenceMap; // Export the component

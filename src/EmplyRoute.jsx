import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';
import { Point, LineString } from 'ol/geom';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style, Stroke, Fill, Circle } from 'ol/style'; // Ensure Circle is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; // Import FontAwesome icons

const EmplyRoute = ({ lastLocX, lastLocY, routePoints, mapCenter, isMapVisible, setIsMapVisible }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || !isMapVisible) return;

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: fromLonLat(mapCenter), // Ensure mapCenter is [longitude, latitude]
                zoom: 10,
            }),
        });

        const features = [];

        // Create route feature if routePoints are provided
        if (routePoints && routePoints.length > 0) {
            const routeCoordinates = routePoints.map((point) => fromLonLat([point[1], point[0]])); // Ensure correct order: [longitude, latitude]

            const routeFeature = new Feature({
                geometry: new LineString(routeCoordinates),
            });

            routeFeature.setStyle(
                new Style({
                    stroke: new Stroke({
                        color: '#FF0000',
                        width: 2,
                    }),
                })
            );

            features.push(routeFeature);

            // Handle the first coordinate (green icon without circle dot)
            if (routePoints.length > 0) {
                const firstPoint = routePoints[0];
                const firstDotFeature = new Feature({
                    geometry: new Point(fromLonLat([firstPoint[1], firstPoint[0]])), // Ensure correct order
                });

                firstDotFeature.setStyle(
                    new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Green icon URL
                            scale: 0.05,
                            color: 'green', // Adjust color to green if applicable
                        }),
                    })
                );

                features.push(firstDotFeature);
            }

            // Handle the middle coordinates (circle dots)
            for (let i = 1; i < routePoints.length - 1; i++) {
                const point = routePoints[i];
                const dotFeature = new Feature({
                    geometry: new Point(fromLonLat([point[1], point[0]])), // Ensure correct order
                });

                dotFeature.setStyle(
                    new Style({
                        image: new Circle({
                            radius: 5, // Radius of the circle
                            fill: new Fill({ color: 'blue' }), // Fill color of the circle
                        }),
                    })
                );

                features.push(dotFeature);
            }

            // Handle the last coordinate (red icon)
            if (routePoints.length > 1) {
                const lastPoint = routePoints[routePoints.length - 1];
                const lastDotFeature = new Feature({
                    geometry: new Point(fromLonLat([lastPoint[1], lastPoint[0]])), // Ensure correct order
                });

                lastDotFeature.setStyle(
                    new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Red icon URL
                            scale: 0.05,
                            color: 'red', // Adjust color to red if applicable
                        }),
                    })
                );

                features.push(lastDotFeature);
            }
        }

        // Create icon feature for the last location if provided
        if (lastLocX && lastLocY) {
            const iconFeature = new Feature({
                geometry: new Point(fromLonLat([lastLocY, lastLocX])), // Ensure correct order
            });

            iconFeature.setStyle(
                new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Use the last coordinate red icon here if needed
                        scale: 0.05,
                    }),
                })
            );

            features.push(iconFeature);
        }

        const vectorSource = new VectorSource({
            features,
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        map.addLayer(vectorLayer);

        return () => {
            map.setTarget(null); // Clean up on unmount
        };
    }, [lastLocX, lastLocY, routePoints, mapCenter, isMapVisible]);

    if (!isMapVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1000,
                backgroundColor: 'white',
            }}
        >
            <button
                onClick={() => setIsMapVisible(false)} // Close the map when clicked
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '5px',
                    cursor: 'pointer',
                    zIndex: 1001,
                }}
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
            <div ref={mapRef} id="map" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default EmplyRoute;

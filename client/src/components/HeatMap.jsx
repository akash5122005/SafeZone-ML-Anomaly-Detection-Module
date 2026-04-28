import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Fix for missing mapbox token warning, usually provide via .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVzdHVzZXIiLCJhIjoiY2x0bWVzdHZ1MDB5dTJpczNrdXFweHZmdyJ9.xxxxxxx';

export default function HeatMap({ incidents }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [80.2707, 13.0827], // Default: Chennai
      zoom: 11,
    });

    mapInstance.current.on("load", () => {
      mapInstance.current.addSource("incidents", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: incidents.map((i) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [i.longitude, i.latitude] },
            properties: { severity: i.severity },
          })),
        },
      });

      mapInstance.current.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "incidents",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "severity"], 1, 0.2, 5, 1],
          "heatmap-intensity": 1.5,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,255,0)",
            0.2, "rgb(0,255,255)",
            0.4, "rgb(0,255,0)",
            0.6, "rgb(255,255,0)",
            0.8, "rgb(255,128,0)",
            1, "rgb(255,0,0)",
          ],
          "heatmap-radius": 30,
        },
      });
    });

    return () => mapInstance.current.remove();
  }, [incidents]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px", borderRadius: "12px" }} />;
}

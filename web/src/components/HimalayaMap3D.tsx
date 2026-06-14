"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { REGIONS, TREK_PINS, MAP_HOME } from "@/lib/himalaya-config";

interface HimalayaMap3DProps {
  onSelectRegion: (regionId: string) => void;
  onSelectTrek: (trekSlug: string) => void;
  selectedRegion: string | null;
  /** Extra bottom padding (px) so flyTo targets clear UI docked over the map */
  bottomPadding?: number;
}

// Free, keyless sources: ESRI World Imagery (satellite) + AWS/Mapzen terrarium DEM (3D terrain)
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 17,
      attribution:
        "Imagery © <a href='https://www.esri.com/'>Esri</a> · Terrain © <a href='https://registry.opendata.aws/terrain-tiles/'>Mapzen/AWS</a>",
    },
    dem: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      tileSize: 256,
      encoding: "terrarium",
      maxzoom: 12,
    },
  },
  layers: [
    { id: "satellite", type: "raster", source: "satellite" },
  ],
  sky: {
    "sky-color": "#0b1526",
    "horizon-color": "#5d7d9c",
    "fog-color": "#c8d6e2",
    "sky-horizon-blend": 0.6,
    "horizon-fog-blend": 0.6,
    "fog-ground-blend": 0.85,
  },
};

export default function HimalayaMap3D({
  onSelectRegion,
  onSelectTrek,
  selectedRegion,
  bottomPadding = 140,
}: HimalayaMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Keep latest callbacks without re-creating the map
  const selectRegionRef = useRef(onSelectRegion);
  const selectTrekRef = useRef(onSelectTrek);
  selectRegionRef.current = onSelectRegion;
  selectTrekRef.current = onSelectTrek;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: MAP_HOME.center,
      zoom: MAP_HOME.zoom,
      pitch: MAP_HOME.pitch,
      bearing: MAP_HOME.bearing,
      minZoom: 4,
      maxZoom: 14.5,
      cooperativeGestures: true,
      attributionControl: { compact: true },
      canvasContextAttributes: { antialias: true, preserveDrawingBuffer: true },
    });
    mapRef.current = map;

    map.on("load", () => {
      map.setTerrain({ source: "dem", exaggeration: 1.5 });
      setLoaded(true);

      // Gentle cinematic drift until the user interacts
      let userTouched = false;
      const stopDrift = () => {
        userTouched = true;
        map.stop();
      };
      map.once("mousedown", stopDrift);
      map.once("touchstart", stopDrift);
      map.once("wheel", stopDrift);
      if (!userTouched) {
        map.easeTo({ bearing: MAP_HOME.bearing + 6, duration: 45000, easing: (t) => t });
      }
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    // ── Trek pins ──
    TREK_PINS.forEach((pin) => {
      const region = REGIONS.find((r) => r.id === pin.regionId);
      const high = pin.maxAltitude > 4000;

      const el = document.createElement("button");
      el.type = "button";
      el.className = `map-pin${high ? " map-pin--high" : ""}`;
      el.style.setProperty("--pin-color", region?.color ?? "#f59e0b");
      el.setAttribute("aria-label", pin.name);
      el.innerHTML = `
        <span class="map-pin-dot"></span>
        <span class="map-pin-label">
          <strong>${pin.name}</strong>
          <em>${pin.maxAltitude.toLocaleString()}m · ${pin.duration}d${high ? " · HIGH ALT" : ""}</em>
        </span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectTrekRef.current(pin.slug);
      });

      new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(pin.lngLat).addTo(map);
    });

    // ── Region labels ──
    REGIONS.forEach((region) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "map-region-label";
      el.style.setProperty("--region-color", region.color);
      el.innerHTML = `<span class="map-region-dot"></span>${region.name}`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectRegionRef.current(region.id);
      });
      new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(region.center)
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to a region when selected (from chips, side panel, or map labels)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const target = selectedRegion ? REGIONS.find((r) => r.id === selectedRegion) : null;
    const padding = { top: 80, bottom: bottomPadding, left: 40, right: 40 };
    if (target) {
      map.flyTo({
        center: target.center,
        zoom: target.zoom,
        pitch: target.pitch,
        bearing: target.bearing,
        padding,
        duration: 2600,
        essential: true,
      });
    } else {
      map.flyTo({ ...MAP_HOME, padding, duration: 2200, essential: true });
    }
  }, [selectedRegion, loaded, bottomPadding]);

  return (
    <div className="absolute inset-0">
      {/* w-full/h-full (not absolute): maplibre css forces position:relative on the container */}
      <div ref={containerRef} className="w-full h-full" />
      {/* Loading veil while tiles stream in */}
      <div
        className={`absolute inset-0 bg-[#0a0f1a] transition-opacity duration-1000 pointer-events-none ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/30 text-xs tracking-[0.3em] uppercase animate-pulse">
            Loading the Himalayas…
          </span>
        </div>
      </div>
      {/* Legibility gradients over the imagery (don't block map interaction) */}
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#0a0f1a]/95 via-[#0a0f1a]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/55 to-transparent pointer-events-none" />
    </div>
  );
}

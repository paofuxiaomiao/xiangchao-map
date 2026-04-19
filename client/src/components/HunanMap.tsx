/**
 * HunanMap - 湘超数字地图看板 · 湖南省GIS地图组件
 * Design: 中文底图 + 市级区域填色 + 湖南轮廓凸显 + 省外遮罩
 * 
 * 视觉层次（从底到顶）：
 * 1. 高德中文底图瓦片
 * 2. 省外灰色遮罩（突出湖南）
 * 3. 市级行政区划填色（队伍主题色）
 * 4. 湖南省轮廓粗边界线
 * 5. 市级边界细线
 * 6. 队伍标记点
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { teams, type Team, HUNAN_CENTER } from '@/data/teams';
import { AnimatePresence, motion } from 'framer-motion';
import Satellite3DMap from './Satellite3DMap';

// CDN URLs for GeoJSON data
const CITIES_GEOJSON_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/hunan_cities_final_02aa81a8.json';
const OUTLINE_GEOJSON_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663486523138/6NztyHB5jaNJh8ykWoD3oc/hunan_outline_final_a33c1dbf.json';

interface HunanMapProps {
  onTeamSelect: (team: Team | null) => void;
  selectedTeam: Team | null;
  show3D: boolean;
  onToggle3D: () => void;
  onResetView: () => void;
}

// City name to team mapping
const cityTeamMap: Record<string, Team | undefined> = {};
teams.forEach((team) => {
  cityTeamMap[team.city] = team;
});

// Default colors for cities without teams
const DEFAULT_CITY_COLOR = '#E8E0D8';
const DEFAULT_CITY_BORDER = '#C5B9AD';

// Create custom stamp marker
function createStampMarker(team: Team, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 50 : 38;
  const ringSize = isSelected ? 64 : 50;

  return L.divIcon({
    className: 'custom-marker',
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    html: `
      <div style="
        width: ${ringSize}px;
        height: ${ringSize}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
      ">
        ${isSelected ? `<div style="
          position: absolute;
          width: ${ringSize + 8}px;
          height: ${ringSize + 8}px;
          border-radius: 50%;
          border: 2px solid ${team.color}60;
          animation: pulse-ring 2s ease-out infinite;
        "></div>` : ''}
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: ${isSelected ? '8px' : '50%'};
          background: ${isSelected
            ? `linear-gradient(135deg, ${team.color}, ${team.color}DD)`
            : `linear-gradient(145deg, ${team.color}EE, ${team.color}BB)`};
          border: ${isSelected ? '3px' : '2.5px'} solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px ${team.color}50,
                      0 4px 16px rgba(0,0,0,0.15);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 2;
          ${isSelected ? 'transform: rotate(-2deg);' : ''}
        ">
          <span style="
            color: white;
            font-family: 'Noto Serif SC', serif;
            font-weight: 900;
            font-size: ${isSelected ? '15' : '12'}px;
            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
            letter-spacing: 2px;
          ">${team.name}</span>
        </div>
        ${team.rank <= 3 ? `
          <div style="
            position: absolute;
            top: ${isSelected ? '-6' : '-4'}px;
            right: ${isSelected ? '-4' : '-2'}px;
            background: linear-gradient(135deg, #FFD700, #F9A825);
            color: #5D4037;
            font-size: 9px;
            font-weight: 900;
            padding: 1px 5px;
            border-radius: 3px;
            font-family: 'Noto Sans SC', sans-serif;
            box-shadow: 0 2px 6px rgba(249, 168, 37, 0.4);
            z-index: 3;
            border: 1px solid rgba(255,255,255,0.6);
          ">${team.rankLabel}</div>
        ` : ''}
      </div>
    `,
  });
}

export default function HunanMap({ onTeamSelect, selectedTeam, show3D, onToggle3D, onResetView }: HunanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const cityLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [geoLoaded, setGeoLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: HUNAN_CENTER,
      zoom: 7.8,
      minZoom: 6,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [23.5, 107.5],
        [31.5, 115.5],
      ],
    });

    // Chinese tile layer - GaoDe (高德地图) light style
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Load GeoJSON data and render city regions
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || geoLoaded) return;
    const map = mapInstanceRef.current;

    const loadGeoData = async () => {
      try {
        // Load both datasets in parallel
        const [citiesRes, outlineRes] = await Promise.all([
          fetch(CITIES_GEOJSON_URL),
          fetch(OUTLINE_GEOJSON_URL),
        ]);
        const citiesData = await citiesRes.json();
        const outlineData = await outlineRes.json();

        // 1. Province-outside mask: a huge polygon with a hole for Hunan
        const outlineCoords = outlineData.features[0].geometry.coordinates;
        // Create a world-covering polygon with Hunan as a hole
        const worldBounds: [number, number][] = [
          [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180],
        ];
        
        // For MultiPolygon, get the main polygon (largest)
        let mainRing: number[][] = [];
        if (outlineData.features[0].geometry.type === 'MultiPolygon') {
          // Find the largest ring
          let maxLen = 0;
          for (const poly of outlineCoords) {
            if (poly[0] && poly[0].length > maxLen) {
              maxLen = poly[0].length;
              mainRing = poly[0];
            }
          }
        } else {
          mainRing = outlineCoords[0];
        }

        // Create mask polygon (world minus Hunan)
        const maskCoords: [number, number][][] = [
          worldBounds,
          mainRing.map((c: number[]) => [c[1], c[0]] as [number, number]),
        ];

        L.polygon(maskCoords, {
          fillColor: '#F5F0EB',
          fillOpacity: 0.75,
          stroke: false,
          interactive: false,
        }).addTo(map);

        // 2. City-level regions with team colors
        citiesData.features.forEach((feature: any) => {
          const cityName = feature.properties.name;
          const team = cityTeamMap[cityName];

          const cityLayer = L.geoJSON(feature, {
            style: () => ({
              fillColor: team ? team.color : DEFAULT_CITY_COLOR,
              fillOpacity: team ? 0.18 : 0.08,
              color: team ? team.color : DEFAULT_CITY_BORDER,
              weight: 1.2,
              opacity: team ? 0.45 : 0.25,
            }),
            onEachFeature: (_feat, layer) => {
              if (team) {
                layer.on({
                  mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({
                      fillOpacity: 0.32,
                      weight: 2,
                      opacity: 0.7,
                    });
                    l.bringToFront();
                  },
                  mouseout: (e) => {
                    const isSelected = selectedTeam?.id === team.id;
                    const l = e.target;
                    l.setStyle({
                      fillOpacity: isSelected ? 0.28 : 0.18,
                      weight: isSelected ? 2.5 : 1.2,
                      opacity: isSelected ? 0.6 : 0.45,
                    });
                  },
                  click: () => {
                    onTeamSelect(team);
                  },
                });
              }
            },
          }).addTo(map);

          cityLayersRef.current.set(cityName, cityLayer);
        });

        // 3. Province outline - thick red border on top
        L.geoJSON(outlineData, {
          style: () => ({
            fillColor: 'transparent',
            fillOpacity: 0,
            color: '#C62828',
            weight: 3.5,
            opacity: 0.8,
            lineCap: 'round' as any,
            lineJoin: 'round' as any,
          }),
          interactive: false,
        }).addTo(map);

        // 4. Add city name labels for cities with teams
        teams.forEach((team) => {
          const cityFeature = citiesData.features.find(
            (f: any) => f.properties.name === team.city
          );
          if (cityFeature) {
            const center = cityFeature.properties.center;
            // Small city label below the marker
            const label = L.divIcon({
              className: 'city-label',
              iconSize: [80, 20],
              iconAnchor: [40, -18],
              html: `<div style="
                text-align: center;
                font-size: 10px;
                font-family: 'Noto Sans SC', sans-serif;
                font-weight: 600;
                color: ${team.color};
                text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0.85;
              ">${team.city.replace('市', '').replace('土家族苗族自治州', '')}</div>`,
            });
            L.marker([center[1], center[0]], { icon: label, interactive: false }).addTo(map);
          }
        });

        setGeoLoaded(true);
      } catch (err) {
        console.error('Failed to load GeoJSON:', err);
      }
    };

    loadGeoData();
  }, [mapReady, geoLoaded, onTeamSelect]);

  // Add team markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !geoLoaded) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    teams.forEach((team, index) => {
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        const isSelected = selectedTeam?.id === team.id;
        const marker = L.marker([team.lat, team.lng], {
          icon: createStampMarker(team, isSelected),
          zIndexOffset: isSelected ? 1000 : (10 - team.rank) * 10,
        });

        marker.on('click', () => {
          onTeamSelect(team);
        });

        marker.addTo(map);
        markersRef.current.set(team.id, marker);
      }, 100 + index * 60);
    });
  }, [mapReady, geoLoaded, onTeamSelect]);

  // Update markers and city highlights when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Update markers
    markersRef.current.forEach((marker, teamId) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;
      const isSelected = selectedTeam?.id === teamId;
      marker.setIcon(createStampMarker(team, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : (10 - team.rank) * 10);
    });

    // Update city region highlights
    cityLayersRef.current.forEach((layer, cityName) => {
      const team = cityTeamMap[cityName];
      if (!team) return;
      const isSelected = selectedTeam?.id === team.id;
      layer.setStyle({
        fillOpacity: isSelected ? 0.30 : 0.18,
        weight: isSelected ? 2.5 : 1.2,
        opacity: isSelected ? 0.65 : 0.45,
        color: team.color,
        fillColor: team.color,
      });
    });

    if (selectedTeam) {
      map.flyTo([selectedTeam.lat, selectedTeam.lng], 9.5, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedTeam]);

  // Reset view when exiting 3D and no team selected
  useEffect(() => {
    if (!show3D && !selectedTeam && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(HUNAN_CENTER, 7.8, { duration: 1 });
    }
  }, [show3D, selectedTeam]);

  return (
    <div className="relative w-full h-full">
      {/* 2D Leaflet Map */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 3D Satellite Map Overlay */}
      <AnimatePresence>
        {show3D && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Satellite3DMap team={selectedTeam} onClose={onToggle3D} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle edge vignette */}
      {!show3D && (
        <div className="absolute inset-0 pointer-events-none z-[500]">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#F5F0EB]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F5F0EB]/50 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-[#F5F0EB]/30 to-transparent" />
        </div>
      )}
    </div>
  );
}

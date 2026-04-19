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
 * 7. 长沙服务图层示例（球队 / 场馆 / 餐饮 / 住宿 / 停车 / 湘菜）
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CarFront, ChevronLeft, ChevronRight, MapPinned, Soup, Store, Trophy } from 'lucide-react';
import { teams, type Team, HUNAN_CENTER } from '@/data/teams';
import { featureTeams, h5LayerOptions, h5Pois, type H5Poi, type PoiLayer } from '@/data/feature-data';
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

const CHANGSHA_TEAM = teams.find((team) => team.id === 'changsha') as Team;
const CHANGSHA_FEATURE = featureTeams.find((team) => team.id === 'changsha');
const CHANGSHA_DEMO_CENTER: [number, number] = [28.226, 112.978];
const CHANGSHA_DEMO_POIS = h5Pois.filter((poi) => poi.city === '长沙');

const LAYER_META: Record<PoiLayer, { label: string; hint: string }> = {
  team: { label: '球队', hint: '查看长沙队信息与球队位置' },
  stadium: { label: '场馆', hint: '查看贺龙体育场位置与场馆说明' },
  food: { label: '餐饮', hint: '赛前赛后可停留的球迷餐饮点' },
  hotel: { label: '住宿', hint: '适合观赛人群的住宿配套点' },
  parking: { label: '停车', hint: '比赛日停车建议与停靠点' },
  cuisine: { label: '湘菜', hint: '结合观赛路线的长沙湘菜体验点' },
};

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

function createServiceMarker(poi: H5Poi, active: boolean): L.DivIcon {
  const outerSize = active ? 42 : 34;
  const coreSize = active ? 24 : 18;

  return L.divIcon({
    className: 'service-marker',
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    html: `
      <div style="
        width: ${outerSize}px;
        height: ${outerSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        filter: drop-shadow(0 10px 18px rgba(15,23,42,0.18));
      ">
        <div style="
          position: absolute;
          width: ${outerSize}px;
          height: ${outerSize}px;
          border-radius: 999px;
          background: ${poi.color ?? '#D32F2F'}22;
          border: 1px solid ${poi.color ?? '#D32F2F'}55;
          ${active ? 'animation: pulse-service 1.8s ease-out infinite;' : ''}
        "></div>
        <div style="
          position: absolute;
          width: ${coreSize + 8}px;
          height: ${coreSize + 8}px;
          border-radius: 999px;
          background: white;
          border: 2px solid ${poi.color ?? '#D32F2F'};
        "></div>
        <div style="
          position: relative;
          width: ${coreSize}px;
          height: ${coreSize}px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${poi.color ?? '#D32F2F'}, ${(poi.color ?? '#D32F2F')}CC);
          box-shadow: 0 4px 12px ${(poi.color ?? '#D32F2F')}55;
        "></div>
      </div>
    `,
  });
}

function createPopupHtml(poi: H5Poi): string {
  const meta = LAYER_META[poi.layer];

  if (poi.layer === 'team') {
    return `
      <div style="width: 240px; font-family: 'Noto Sans SC', sans-serif; color: #1f2937;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
          <div>
            <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">${meta.label}</div>
            <div style="margin-top:4px; font-size:18px; font-weight:900; color:${CHANGSHA_TEAM.color}; font-family:'Noto Serif SC', serif;">${CHANGSHA_TEAM.fullName}</div>
          </div>
          <div style="padding:6px 10px; border-radius:999px; background:${CHANGSHA_TEAM.color}14; color:${CHANGSHA_TEAM.color}; font-size:11px; font-weight:700;">长沙示例</div>
        </div>
        <div style="padding:12px 14px; border-radius:16px; background:linear-gradient(135deg, ${CHANGSHA_TEAM.color}14, rgba(255,255,255,0.96)); border:1px solid rgba(229,231,235,0.9);">
          <div style="font-size:13px; font-weight:700; color:${CHANGSHA_TEAM.color};">${CHANGSHA_FEATURE?.slogan ?? '星城出征，所向披靡！'}</div>
          <div style="margin-top:8px; font-size:13px; line-height:1.7; color:#4b5563;">${CHANGSHA_FEATURE?.story ?? poi.detail}</div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
          <div style="padding:10px 12px; border-radius:14px; background:#F8FAFC; border:1px solid #E5E7EB;">
            <div style="font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">主场</div>
            <div style="margin-top:6px; font-size:12px; font-weight:700; color:#111827;">${CHANGSHA_TEAM.stadium}</div>
          </div>
          <div style="padding:10px 12px; border-radius:14px; background:#F8FAFC; border:1px solid #E5E7EB;">
            <div style="font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">战绩</div>
            <div style="margin-top:6px; font-size:12px; font-weight:700; color:#111827;">${CHANGSHA_FEATURE?.lastSeasonRecord ?? '上赛季常规赛第 1，最终获得季军。'}</div>
          </div>
        </div>
      </div>
    `;
  }

  if (poi.layer === 'stadium') {
    return `
      <div style="width: 236px; font-family: 'Noto Sans SC', sans-serif; color: #1f2937;">
        <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">${meta.label}</div>
        <div style="margin-top:4px; font-size:18px; font-weight:900; color:${poi.color ?? '#C62828'}; font-family:'Noto Serif SC', serif;">${poi.title}</div>
        <div style="margin-top:4px; display:inline-flex; padding:4px 10px; border-radius:999px; background:${poi.color ?? '#C62828'}14; color:${poi.color ?? '#C62828'}; font-size:11px; font-weight:700;">${poi.subtitle}</div>
        <div style="margin-top:12px; padding:12px 14px; border-radius:16px; background:#F8FAFC; border:1px solid #E5E7EB; font-size:13px; line-height:1.7; color:#4b5563;">
          ${poi.detail}
        </div>
        <div style="margin-top:10px; font-size:12px; color:#374151; line-height:1.7;">
          <strong style="color:#111827;">关联球队：</strong>${CHANGSHA_TEAM.fullName}<br />
          <strong style="color:#111827;">观赛提示：</strong>适合与球队层联动展示主场与周边配套。
        </div>
      </div>
    `;
  }

  return `
    <div style="width: 228px; font-family: 'Noto Sans SC', sans-serif; color: #1f2937;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b7280;">${meta.label}</div>
        <div style="padding:4px 8px; border-radius:999px; background:${poi.color ?? '#D32F2F'}14; color:${poi.color ?? '#D32F2F'}; font-size:11px; font-weight:700;">长沙示例</div>
      </div>
      <div style="margin-top:6px; font-size:17px; font-weight:900; color:${poi.color ?? '#D32F2F'}; font-family:'Noto Serif SC', serif;">${poi.title}</div>
      <div style="margin-top:4px; font-size:12px; color:#6b7280;">${poi.subtitle}</div>
      <div style="margin-top:12px; padding:12px 14px; border-radius:16px; background:#F8FAFC; border:1px solid #E5E7EB; font-size:13px; line-height:1.7; color:#4b5563;">
        ${poi.detail}
      </div>
      <div style="margin-top:10px; font-size:12px; color:#374151; line-height:1.7;">
        <strong style="color:#111827;">服务定位：</strong>${meta.hint}<br />
        <strong style="color:#111827;">联动建议：</strong>适合与比赛日动线、球迷服务或文旅推荐一起展示。
      </div>
    </div>
  `;
}

export default function HunanMap({ onTeamSelect, selectedTeam, show3D, onToggle3D }: HunanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const serviceMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const cityLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [geoLoaded, setGeoLoaded] = useState(false);
  const [activeServiceLayer, setActiveServiceLayer] = useState<PoiLayer>('team');
  const [activeServicePoiId, setActiveServicePoiId] = useState<string>('team-changsha');
  const [legendExpanded, setLegendExpanded] = useState(true);

  const activeServicePoi = useMemo(() => {
    return CHANGSHA_DEMO_POIS.find((poi) => poi.id === activeServicePoiId) ?? CHANGSHA_DEMO_POIS[0] ?? null;
  }, [activeServicePoiId]);

  const currentLayerPois = useMemo(() => {
    return CHANGSHA_DEMO_POIS.filter((poi) => poi.layer === activeServiceLayer);
  }, [activeServiceLayer]);

  const focusChangshaDemo = useCallback((layer: PoiLayer, immediate = false) => {
    if (!mapInstanceRef.current) return;
    const zoom = layer === 'team' ? 10.6 : layer === 'stadium' ? 13.2 : 13.8;
    mapInstanceRef.current.flyTo(CHANGSHA_DEMO_CENTER, zoom, {
      duration: immediate ? 0 : 1,
      easeLinearity: 0.25,
    });
  }, []);

  const handleLayerSwitch = useCallback((layer: PoiLayer) => {
    const firstPoi = CHANGSHA_DEMO_POIS.find((poi) => poi.layer === layer);
    setActiveServiceLayer(layer);
    setActiveServicePoiId(firstPoi?.id ?? 'team-changsha');
    setLegendExpanded(true);
    focusChangshaDemo(layer);

    if (layer === 'team' || layer === 'stadium') {
      onTeamSelect(CHANGSHA_TEAM);
    } else if (selectedTeam?.id === 'changsha') {
      onTeamSelect(null);
    }
  }, [focusChangshaDemo, onTeamSelect, selectedTeam]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: HUNAN_CENTER,
      zoom: 7.8,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [23.5, 107.5],
        [31.5, 115.5],
      ],
    });

    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const collapseLegend = () => {
      setLegendExpanded(false);
    };

    map.on('dragstart', collapseLegend);
    map.on('zoomstart', collapseLegend);
    map.on('click', collapseLegend);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.off('dragstart', collapseLegend);
      map.off('zoomstart', collapseLegend);
      map.off('click', collapseLegend);
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
        const [citiesRes, outlineRes] = await Promise.all([
          fetch(CITIES_GEOJSON_URL),
          fetch(OUTLINE_GEOJSON_URL),
        ]);
        const citiesData = await citiesRes.json();
        const outlineData = await outlineRes.json();

        const outlineCoords = outlineData.features[0].geometry.coordinates;
        const worldBounds: [number, number][] = [
          [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180],
        ];

        let mainRing: number[][] = [];
        if (outlineData.features[0].geometry.type === 'MultiPolygon') {
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
                    const currentLayer = e.target;
                    currentLayer.setStyle({
                      fillOpacity: 0.32,
                      weight: 2,
                      opacity: 0.7,
                    });
                    currentLayer.bringToFront();
                  },
                  mouseout: (e) => {
                    const isSelected = selectedTeam?.id === team.id;
                    const currentLayer = e.target;
                    currentLayer.setStyle({
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

        teams.forEach((team) => {
          const cityFeature = citiesData.features.find((f: any) => f.properties.name === team.city);
          if (cityFeature) {
            const center = cityFeature.properties.center;
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
  }, [mapReady, geoLoaded, onTeamSelect, selectedTeam]);

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

        if (team.id === 'changsha') {
          const teamPoi = CHANGSHA_DEMO_POIS.find((poi) => poi.layer === 'team');
          if (teamPoi) {
            marker.bindPopup(createPopupHtml(teamPoi), {
              closeButton: false,
              autoPanPadding: [24, 24],
              offset: [0, -16],
              className: 'xiangchao-map-popup',
              maxWidth: 260,
              minWidth: 220,
            });
            marker.on('popupopen', () => {
              setActiveServicePoiId(teamPoi.id);
            });
          }
        }

        marker.on('click', () => {
          onTeamSelect(team);
          if (team.id === 'changsha') {
            setActiveServiceLayer('team');
            setActiveServicePoiId('team-changsha');
          }
        });

        marker.addTo(map);
        markersRef.current.set(team.id, marker);
      }, 100 + index * 60);
    });
  }, [mapReady, geoLoaded, onTeamSelect, selectedTeam]);

  // Render Changsha service example markers according to active layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !geoLoaded) return;

    serviceMarkersRef.current.forEach((marker) => marker.remove());
    serviceMarkersRef.current.clear();

    if (show3D) return;

    if (activeServiceLayer === 'team') {
      const changshaMarker = markersRef.current.get('changsha');
      if (changshaMarker && selectedTeam?.id === 'changsha') {
        setTimeout(() => {
          changshaMarker.openPopup();
        }, 120);
      }
      return;
    }

    const map = mapInstanceRef.current;

    currentLayerPois.forEach((poi) => {
      const marker = L.marker([poi.lat, poi.lng], {
        icon: createServiceMarker(poi, activeServicePoiId === poi.id),
        zIndexOffset: activeServicePoiId === poi.id ? 1800 : 1200,
      });

      marker.bindPopup(createPopupHtml(poi), {
        closeButton: false,
        autoPanPadding: [24, 24],
        offset: [0, -16],
        className: 'xiangchao-map-popup',
        maxWidth: 260,
        minWidth: 220,
      });

      marker.on('click', () => {
        setActiveServicePoiId(poi.id);
        if (poi.layer === 'stadium') {
          onTeamSelect(CHANGSHA_TEAM);
        }
      });

      marker.on('popupopen', () => {
        setActiveServicePoiId(poi.id);
      });

      marker.addTo(map);
      serviceMarkersRef.current.set(poi.id, marker);

      if (activeServicePoiId === poi.id) {
        setTimeout(() => marker.openPopup(), 120);
      }
    });
  }, [activeServiceLayer, activeServicePoiId, currentLayerPois, geoLoaded, mapReady, onTeamSelect, selectedTeam, show3D]);

  // Update markers and city highlights when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker, teamId) => {
      const team = teams.find((current) => current.id === teamId);
      if (!team) return;
      const isSelected = selectedTeam?.id === teamId;
      marker.setIcon(createStampMarker(team, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : (10 - team.rank) * 10);
    });

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
      const zoom = selectedTeam.id === 'changsha' && activeServiceLayer !== 'team' ? 13 : 9.5;
      map.flyTo([selectedTeam.lat, selectedTeam.lng], zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });

      if (selectedTeam.id === 'changsha' && activeServiceLayer === 'team') {
        setTimeout(() => {
          markersRef.current.get('changsha')?.openPopup();
        }, 160);
      }
    }
  }, [activeServiceLayer, selectedTeam]);

  // Reset view when exiting 3D and no team selected
  useEffect(() => {
    if (!show3D && !selectedTeam && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(HUNAN_CENTER, 7.8, { duration: 1 });
    }
  }, [show3D, selectedTeam]);

  return (
    <div className="relative h-full w-full">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.92); opacity: 0.8; }
          70% { transform: scale(1.12); opacity: 0; }
          100% { transform: scale(1.12); opacity: 0; }
        }
        @keyframes pulse-service {
          0% { transform: scale(0.92); opacity: 0.9; }
          70% { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        .xiangchao-map-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
          padding: 0;
          border: 1px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.98);
        }
        .xiangchao-map-popup .leaflet-popup-content {
          margin: 14px;
        }
        .xiangchao-map-popup .leaflet-popup-tip {
          background: rgba(255,255,255,0.98);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
      `}</style>

      <div ref={mapRef} className="h-full w-full" />

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

      {!show3D && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 top-4 z-[920]"
          >
            <AnimatePresence mode="wait">
              {legendExpanded ? (
                <motion.div
                  key="legend-expanded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-[340px] max-w-[calc(100vw-5rem)] rounded-[26px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[oklch(0.55_0.02_260)]">Changsha Demo</div>
                      <h3 className="mt-1 text-lg font-black text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        长沙服务图层示例
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-[#D32F2F]/10 px-3 py-1 text-[11px] font-semibold text-[#D32F2F]">
                        已集成到地图
                      </div>
                      <button
                        onClick={() => setLegendExpanded(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[oklch(0.90_0.005_260)] bg-white/85 text-[oklch(0.38_0.02_260)] transition hover:border-[#D32F2F]/20 hover:text-[#D32F2F]"
                        aria-label="收起图例"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-6 text-[oklch(0.44_0.02_260)]">
                    这里先以长沙做交互样例。切换图层后，地图会自动聚焦贺龙体育场周边，并通过点位弹窗展示球队、场馆和周边服务信息。你拖动、缩放或点击地图时，图例会自动收起，减少对地图视野的遮挡。
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {h5LayerOptions.map((layer) => {
                      const isActive = layer.id === activeServiceLayer;
                      const color = CHANGSHA_DEMO_POIS.find((poi) => poi.layer === layer.id)?.color ?? '#D32F2F';
                      return (
                        <button
                          key={layer.id}
                          onClick={() => handleLayerSwitch(layer.id)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? 'border-transparent text-white shadow-lg'
                              : 'border-[oklch(0.90_0.005_260)] bg-[oklch(0.985_0.002_260)] text-[oklch(0.38_0.02_260)] hover:border-[#D32F2F]/18'
                          }`}
                          style={
                            isActive
                              ? {
                                  background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                                  boxShadow: `0 10px 20px ${color}24`,
                                }
                              : undefined
                          }
                        >
                          {layer.label}
                        </button>
                      );
                    })}
                  </div>

                  {activeServicePoi ? (
                    <div className="mt-4 rounded-[22px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">
                            {LAYER_META[activeServiceLayer].label}
                          </div>
                          <div className="mt-1 text-base font-black text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                            {activeServicePoi.title}
                          </div>
                        </div>
                        <div
                          className="h-10 w-10 rounded-2xl"
                          style={{ background: `linear-gradient(135deg, ${activeServicePoi.color ?? '#D32F2F'}, ${(activeServicePoi.color ?? '#D32F2F')}CC)` }}
                        />
                      </div>
                      <div className="mt-2 text-xs font-semibold" style={{ color: activeServicePoi.color ?? '#D32F2F' }}>
                        {activeServicePoi.subtitle}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[oklch(0.42_0.02_260)]">{activeServicePoi.detail}</p>
                      <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-xs leading-6 text-[oklch(0.48_0.02_260)]">
                        交互方式：点击图层按钮切换点位；点击地图地标打开弹窗；球队与场馆层可联动右侧球队详情面板，服务层则聚焦商家简介与观赛动线。
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <motion.button
                  key="legend-collapsed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setLegendExpanded(true)}
                  className="flex items-center gap-3 rounded-full border border-white/80 bg-white/92 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:shadow-[0_14px_34px_rgba(15,23,42,0.14)]"
                >
                  <div
                    className="h-9 w-9 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${activeServicePoi?.color ?? '#D32F2F'}, ${(activeServicePoi?.color ?? '#D32F2F')}CC)` }}
                  />
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.55_0.02_260)]">长沙图例</div>
                    <div className="mt-0.5 text-sm font-bold text-[oklch(0.18_0.02_260)]">{LAYER_META[activeServiceLayer].label} · {activeServicePoi?.title ?? '查看详情'}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[oklch(0.42_0.02_260)]" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none z-[500]">
            <div className="absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-[#F5F0EB]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F5F0EB]/50 to-transparent" />
            <div className="absolute bottom-0 top-0 left-0 w-4 bg-gradient-to-r from-[#F5F0EB]/30 to-transparent" />
          </div>

          <div className="pointer-events-none absolute bottom-5 left-4 z-[760] hidden rounded-2xl border border-white/80 bg-white/88 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-md md:flex md:items-center md:gap-2">
            {layerIcon(activeServiceLayer)}
            <span className="text-xs text-[oklch(0.42_0.02_260)]">当前图层：长沙 · {LAYER_META[activeServiceLayer].label} · 图例已支持自动收起</span>
          </div>
        </>
      )}
    </div>
  );
}

function layerIcon(layer: PoiLayer) {
  if (layer === 'team') return <Trophy className="h-3.5 w-3.5 text-[#D32F2F]" />;
  if (layer === 'stadium') return <MapPinned className="h-3.5 w-3.5 text-[#C62828]" />;
  if (layer === 'food') return <Store className="h-3.5 w-3.5 text-[#FF8A65]" />;
  if (layer === 'hotel') return <Building2 className="h-3.5 w-3.5 text-[#5C6BC0]" />;
  if (layer === 'parking') return <CarFront className="h-3.5 w-3.5 text-[#607D8B]" />;
  return <Soup className="h-3.5 w-3.5 text-[#FFB300]" />;
}

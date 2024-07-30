import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface EXIF {
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

interface MapComponentProps {
  mapboxToken: string;
  exifData: EXIF | null;
}

export default function MapComponent({ mapboxToken, exifData }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);

  useEffect(() => {
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    }

    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [104.32, 30.23],
        zoom: 2
      });
    }

    // 从 EXIF 数据中提取经纬度
    if (exifData && exifData.latitude && exifData.longitude) {
      setLng(exifData.longitude);
      setLat(exifData.latitude);
    }
  }, [mapboxToken, exifData]);

  useEffect(() => {
    if (map.current && lng !== null && lat !== null) {
      // 更新地图中心
      map.current.flyTo({
        center: [lng, lat],
        zoom: 13
      });

      // 更新或创建标记
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);
      }
    }
  }, [lng, lat]);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}

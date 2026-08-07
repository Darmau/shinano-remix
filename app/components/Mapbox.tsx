import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { setupMapboxLanguage } from "~/utils/mapbox";

export interface EXIF {
  latitude?: number | null;
  longitude?: number | null;
}

interface MapComponentProps {
  mapboxToken: string;
  exifData: EXIF | null;
  lang?: string;
}

export default function MapComponent({ mapboxToken, exifData, lang = 'en' }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const isMapLoaded = useRef(false);
  const exifDataRef = useRef(exifData);
  const languageControlRef = useRef<ReturnType<typeof setupMapboxLanguage> | null>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  
  // 保持 exifData ref 最新
  useEffect(() => {
    exifDataRef.current = exifData;
  }, [exifData]);

  // 使用 Intersection Observer 延迟加载地图，直到容器进入视口
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadMap(true);
            observer.disconnect(); // 一旦开始加载就断开观察
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01, // 只要有一点进入视口就加载
      }
    );

    observer.observe(mapContainer.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 初始化地图（只依赖 mapboxToken，不依赖 lang）
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current || !shouldLoadMap) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [104.32, 30.23],
      zoom: 2,
    });

    map.current = mapInstance;
    isMapLoaded.current = false;

    // 添加语言控制插件
    setupMapboxLanguage(mapInstance, lang);

    // 监听地图加载完成事件
    const handleMapLoad = () => {
      isMapLoaded.current = true;
      
      // 如果地图加载完成时已经有 exifData，立即应用
      const currentExif = exifDataRef.current;
      
      if (!currentExif) {
        console.log('No exifData available yet');
        return;
      }
      
      const latitude = currentExif.latitude;
      const longitude = currentExif.longitude;
      
      if (latitude == null || longitude == null) {
        console.log('No GPS coordinates in exifData');
        return;
      }
      
      const lat = Number(latitude);
      const lng = Number(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid GPS coordinates on load:', { latitude, longitude });
        return;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn('GPS coordinates out of range on load:', { lat, lng });
        return;
      }
      

      const target: [number, number] = [lng, lat];
      
      mapInstance.flyTo({
        center: target,
        zoom: 13,
      });

      if (!marker.current) {
        marker.current = new mapboxgl.Marker();
        marker.current.setLngLat(target); // 必须先设置位置
        marker.current.addTo(mapInstance); // 然后再添加到地图
      } else {
        marker.current.setLngLat(target);
      }
    };
    
    mapInstance.on('load', handleMapLoad);

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      mapInstance.remove();
      map.current = null;
      isMapLoaded.current = false;
      languageControlRef.current = null;
    };
  }, [mapboxToken, shouldLoadMap]); // 依赖 shouldLoadMap，延迟加载直到进入视口

  // 处理 exifData 变化
  useEffect(() => {
    console.log('exifData changed:', exifData);
    
    if (!map.current || !isMapLoaded.current) {
      console.log('Map not ready yet, skipping update');
      return;
    }

    if (!exifData) {
      console.log('No exifData provided');
      return;
    }

    const latitude = exifData.latitude;
    const longitude = exifData.longitude;

    // 检查是否有有效的坐标
    if (latitude == null || longitude == null) {
      console.log('No GPS coordinates in exifData, removing marker');
      // 如果没有坐标，移除现有标记
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      return;
    }

    // 转换为数字并验证
    const lat = Number(latitude);
    const lng = Number(longitude);

    // 确保坐标是有效数字
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid GPS coordinates:', { latitude, longitude });
      return;
    }

    // 验证经纬度范围
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('GPS coordinates out of range:', { lat, lng });
      return;
    }

    const target: [number, number] = [lng, lat];
    
    // 先移动地图
    map.current.flyTo({
      center: target,
      zoom: 13,
    });

    // 创建或更新标记
    if (!marker.current) {
      marker.current = new mapboxgl.Marker();
      marker.current.setLngLat(target); // 必须先设置位置
      marker.current.addTo(map.current); // 然后再添加到地图
    } else {
      marker.current.setLngLat(target);
    }
  }, [exifData]);

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}

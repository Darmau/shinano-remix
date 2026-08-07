import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { setupMapboxLanguage } from "~/utils/mapbox";
import { XMarkIcon } from "@heroicons/react/24/outline";
import getLanguageLabel from "~/utils/getLanguageLabel";
import AlbumText from "~/locales/album";

export interface MapImageFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    imageId: number;
    storageKey: string;
    alt: string | null;
    caption: string | null;
    location: string | null;
    width: number;
    height: number;
    albums: Array<{
      id: number;
      slug: string;
      title: string;
      publishedAt: string;
    }>;
  };
}

export interface MapImageCollection {
  type: "FeatureCollection";
  features: MapImageFeature[];
}

type MapAlbum = MapImageFeature["properties"]["albums"][number];

interface MapGalleryProps {
  mapboxToken: string;
  imageCollection: MapImageCollection;
  imgPrefix: string;
  lang: string;
}

export default function MapGallery({
  mapboxToken,
  imageCollection,
  imgPrefix,
  lang,
}: MapGalleryProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedImage, setSelectedImage] = useState<MapImageFeature | null>(null);
  const [clusterImages, setClusterImages] = useState<MapImageFeature[]>([]);
  const hasFitToBounds = useRef(false);
  const imageCollectionRef = useRef(imageCollection);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const label = getLanguageLabel(AlbumText, lang);

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

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current || !shouldLoadMap) return;

    mapboxgl.accessToken = mapboxToken;

    // 初始化地图
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [104.32, 30.23], // 默认中心
      zoom: 2,
      scrollZoom: false, // 禁用滚轮缩放，让页面可以正常滚动
    });

    map.current = mapInstance;

    // 添加导航控件（缩放按钮）
    const nav = new mapboxgl.NavigationControl({
      showCompass: true, // 显示指南针
      showZoom: true, // 显示缩放按钮
    });
    mapInstance.addControl(nav, 'top-left');

    // 添加语言控制插件
    setupMapboxLanguage(mapInstance, lang);

    mapInstance.on("load", () => {
      // 添加数据源
      mapInstance.addSource("photos", {
        type: "geojson",
        data: imageCollection,
        cluster: true,
        clusterMaxZoom: 12, // 最大聚合层级（降低，更早停止聚合）
        clusterRadius: 30, // 聚合半径（像素）- 更小让点更分散
      });

      // 添加聚合圆圈图层
      mapInstance.addLayer({
        id: "clusters",
        type: "circle",
        source: "photos",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#7c3aed", // 紫色
            10,
            "#6d28d9",
            30,
            "#5b21b6",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            14, // 小于10个点
            10,
            18, // 10-30个点
            30,
            24, // 大于30个点
          ],
        },
      });

      // 添加聚合数量文字图层
      mapInstance.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "photos",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // 添加单个点图层
      mapInstance.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "photos",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#7c3aed",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // 点击聚合时的处理：根据缩放级别决定是放大还是显示列表
      mapInstance.on("click", "clusters", (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        
        if (!features.length) return;
        
        const clusterId = features[0].properties?.cluster_id;
        const source = mapInstance.getSource("photos") as mapboxgl.GeoJSONSource;
        const currentZoom = mapInstance.getZoom();
        const zoomThreshold = 11; // 缩放阈值：11级（与 clusterMaxZoom 配合）
        
        // 如果当前缩放级别达到阈值，直接显示图片列表
        if (currentZoom >= zoomThreshold) {
          // 获取聚合中的所有图片
          source.getClusterLeaves(
            clusterId,
            Number.MAX_SAFE_INTEGER, // 获取所有图片
            0, // 偏移量
            (err, leaves) => {
              if (err || !leaves) return;
              
              // 从原始数据中查找对应的完整 feature
              const clusterFeatures: MapImageFeature[] = leaves
                .map((leaf: any) => {
                  const imageId = leaf.properties?.imageId;
                  return imageCollectionRef.current.features.find(
                    (f: MapImageFeature) => f.properties.imageId === imageId
                  );
                })
                .filter((f: MapImageFeature | undefined): f is MapImageFeature => f !== undefined);
              
              setClusterImages(clusterFeatures);
              setSelectedImage(null); // 关闭单个图片详情
            }
          );
        } else {
          // 如果缩放级别未达到阈值，继续放大到分解聚合的级别
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            const geometry = features[0].geometry;
            if (geometry.type === "Point" && zoom !== null) {
              mapInstance.easeTo({
                center: geometry.coordinates as [number, number],
                zoom: zoom,
              });
            }
          });
        }
      });

      // 点击单个点显示详情
      mapInstance.on("click", "unclustered-point", (e) => {
        if (!e.features || !e.features[0]) return;
        
        const clickedFeature = e.features[0];
        const imageId = clickedFeature.properties?.imageId;
        
        // 从原始数据中查找完整的 feature
        const fullFeature = imageCollectionRef.current.features.find(
          (f: MapImageFeature) => f.properties.imageId === imageId
        );
        
        if (fullFeature) {
          setSelectedImage(fullFeature);
          setClusterImages([]); // 关闭聚合列表
          
          // 放大到该点位，增加缩放级别以获得更好的视图
          const coordinates = fullFeature.geometry.coordinates as [number, number];
          mapInstance.flyTo({
            center: coordinates,
            zoom: 15, // 缩放级别：15 = 街道级别，可以看清周围环境
            duration: 1000, // 动画持续时间（毫秒）
            essential: true, // 即使用户开启了"减少动画"设置也执行
          });
        }
      });

      // 鼠标悬停样式
      mapInstance.on("mouseenter", "clusters", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", "clusters", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
      mapInstance.on("mouseenter", "unclustered-point", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", "unclustered-point", () => {
        mapInstance.getCanvas().style.cursor = "";
      });

    });

    return () => {
      mapInstance.remove();
      map.current = null;
      hasFitToBounds.current = false;
    };
  }, [mapboxToken, shouldLoadMap]); // 依赖 shouldLoadMap，延迟加载直到进入视口

  // 更新 imageCollection ref
  useEffect(() => {
    imageCollectionRef.current = imageCollection;
  }, [imageCollection]);

  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;
    const updateSource = () => {
      const source = mapInstance.getSource("photos") as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      source.setData(imageCollection as MapImageCollection);

      if (imageCollection.features.length === 0) {
        hasFitToBounds.current = false;
        return;
      }

      if (!hasFitToBounds.current) {
        const bounds = new mapboxgl.LngLatBounds();
        imageCollection.features.forEach((feature: MapImageFeature) => {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        });
        mapInstance.fitBounds(bounds, { padding: 50 });
        hasFitToBounds.current = true;
      }
    };

    if (!mapInstance.isStyleLoaded()) {
      mapInstance.once("load", updateSource);
      return () => {
        mapInstance.off("load", updateSource);
      };
    }

    updateSource();
  }, [imageCollection]);

  return (
    <div className="relative w-full max-w-7xl mx-auto h-[75vh] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* 聚合图片列表面板 */}
      {clusterImages.length > 0 && (
        <div className="absolute top-2 md:top-4 w-[90%] md:w-96 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 max-h-[800px] overflow-y-auto bg-white rounded-lg shadow-xl z-10">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
            <h3 className="text-lg font-semibold text-zinc-800">
              {label.map_title} ({clusterImages.length})
            </h3>
            <button
              onClick={() => setClusterImages([])}
              className="text-zinc-500 hover:text-zinc-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-3">
            {clusterImages.map((feature) => (
              <div
                key={feature.properties.imageId}
                onClick={() => {
                  setSelectedImage(feature);
                  setClusterImages([]);
                  // 放大到该点位
                  const coordinates = feature.geometry.coordinates as [number, number];
                  map.current?.flyTo({
                    center: coordinates,
                    zoom: 15,
                    duration: 1000,
                    essential: true,
                  });
                }}
                className="cursor-pointer rounded-lg overflow-hidden bg-zinc-50 hover:bg-zinc-100 transition-colors border border-zinc-200 hover:border-violet-300"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                  <img
                    src={`${imgPrefix}/cdn-cgi/image/format=avif,width=640/${feature.properties.storageKey}`}
                    alt={feature.properties.alt || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  {feature.properties.location && (
                    <p className="text-sm font-medium text-zinc-800 mb-1">
                      {feature.properties.location}
                    </p>
                  )}
                  {feature.properties.caption && (
                    <p className="text-xs text-zinc-600 line-clamp-2">
                      {feature.properties.caption}
                    </p>
                  )}
                  {feature.properties.albums.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {label.albums_count}: {feature.properties.albums.length}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 图片详情面板 */}
      {selectedImage && (
        <div className="absolute top-2 md:top-4 w-[90%] md:w-96 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 max-h-[500px] overflow-y-auto bg-white rounded-lg shadow-xl z-10">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-zinc-800">
              {selectedImage.properties.location || label.map_title}
            </h3>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-zinc-500 hover:text-zinc-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* 图片 */}
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-zinc-100">
              <img
                src={`${imgPrefix}/cdn-cgi/image/format=avif,width=640/${selectedImage.properties.storageKey}`}
                alt={selectedImage.properties.alt || ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* 图片说明 */}
            {selectedImage.properties.caption && (
              <p className="text-sm text-zinc-600">
                {selectedImage.properties.caption}
              </p>
            )}
            
            {/* 相册列表 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-700">
                {label.albums_count} ({selectedImage.properties.albums.length})
              </h4>
              <div className="space-y-2">
                {selectedImage.properties.albums.map((album: MapAlbum) => (
                  <a
                    key={album.id}
                    href={`/${lang}/album/${album.slug}`}
                    className="block p-3 rounded-md bg-zinc-50 hover:bg-zinc-100 transition-colors"
                  >
                    <p className="font-medium text-zinc-800">{album.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(album.publishedAt).toLocaleDateString(lang)}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 图片数量统计 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
        <p className="text-sm text-zinc-600">
          {label.total_photos} <span className="font-semibold text-violet-700">{imageCollection.features.length}</span> {label.photos}
        </p>
      </div>
    </div>
  );
}

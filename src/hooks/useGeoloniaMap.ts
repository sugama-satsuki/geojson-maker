
import { useEffect, useRef, useState } from 'react';
import maplibregl, { type StyleSpecification } from 'maplibre-gl';

export type GeoloniaMapSettings = {
  center: [number, number];
  pitch?: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  localIdeographFontFamily?: string;
  style?: StyleSpecification | string;
};

declare global {
  interface Window {
    geolonia: {
      Popup: new (options?: maplibregl.PopupOptions) => maplibregl.Popup;
      Map: new (options: maplibregl.MapOptions) => maplibregl.Map;
      GeolocateControl: new (options: maplibregl.GeolocateControlOptions) => maplibregl.GeolocateControl;
      NavigationControl: new (options?: maplibregl.NavigationControlOptions) => maplibregl.NavigationControl;
      Marker: new (options?: maplibregl.MarkerOptions) => maplibregl.Marker;
    };
    map?: maplibregl.Map; // Extend Window to include the map property
  }
}

export function useGeoloniaMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: GeoloniaMapSettings
) {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const prevStyleRef = useRef<StyleSpecification | string | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current || !options?.style) { return; }

    const center = map?.getCenter() || [139.767, 35.681] as [number, number];
    const zoom = map?.getZoom() || 10;
    console.log(options.style);
    // mapオブジェクトがなければ新規生成
    const mapObj = new maplibregl.Map({
      container: containerRef.current,
      style: options.style,
      center: center,
      zoom: zoom,
      hash: true,
      attributionControl: false,
    });

    mapObj.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    );

    mapObj.once('load', () => {
      prevStyleRef.current = options.style;
      setMap(mapObj);
    });

    return () => {
      mapObj.remove();
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, setMap, options?.style]);

  return map;
}

export default useGeoloniaMap;


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
    __mapReady?: boolean;
    geolonia: {
      Map: new (options: maplibregl.MapOptions) => maplibregl.Map;
    };
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

    const MapConstructor = window.geolonia?.Map ?? maplibregl.Map;
    const mapObj = new MapConstructor({
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
      window.__mapReady = true;
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

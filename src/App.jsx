import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import './App.css';


function App() {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [139.767, 35.681], // 東京駅
      zoom: 12,
    });
    return () => map.remove();
  }, []);

  return (
    <div>
      <h1>MapLibre 地図表示サンプル</h1>
      <div ref={mapContainer} style={{ width: '100%', height: '500px', border: '1px solid #ccc' }} />
    </div>
  );
}

export default App

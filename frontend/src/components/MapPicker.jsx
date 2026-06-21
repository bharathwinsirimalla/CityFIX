import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    }
  });
  return null;
}

export default function MapPicker({ value, onChange }) {
  const center = useMemo(() => {
    if (value?.latitude && value?.longitude) return [value.latitude, value.longitude];
    return [20.5937, 78.9629]; // India default
  }, [value]);

  return (
    <div className="overflow-hidden rounded-lg border">
      <MapContainer center={center} zoom={value ? 14 : 5} style={{ height: 320, width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {value?.latitude && value?.longitude && <Marker position={[value.latitude, value.longitude]} />}
      </MapContainer>
    </div>
  );
}


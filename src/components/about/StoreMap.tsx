import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Store {
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

const stores: Store[] = [
  {
    name: "LINEA Madison Avenue",
    address: "789 Madison Avenue, New York, NY 10065",
    phone: "+1 (212) 555-0123",
    hours: "Mon-Sat: 10AM-8PM, Sun: 12PM-6PM",
    lat: 40.7614,
    lng: -73.9776
  },
  {
    name: "LINEA Beverly Hills", 
    address: "456 Rodeo Drive, Beverly Hills, CA 90210",
    phone: "+1 (310) 555-0456",
    hours: "Mon-Sat: 10AM-8PM, Sun: 12PM-6PM",
    lat: 34.0696,
    lng: -118.4014
  },
  {
    name: "LINEA SoHo",
    address: "123 Spring Street, New York, NY 10012", 
    phone: "+1 (212) 555-0789",
    hours: "Mon-Sat: 11AM-8PM, Sun: 12PM-7PM",
    lat: 40.7253,
    lng: -74.0022
  }
];

const StoreMap = () => {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[39.8283, -98.5795]} // Center of US
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stores.map((store, index) => (
          <Marker key={index} position={[store.lat, store.lng]}>
            <Popup className="font-light">
              <div className="space-y-2 min-w-[200px]">
                <h3 className="font-medium text-foreground">{store.name}</h3>
                <p className="text-sm text-muted-foreground">{store.address}</p>
                <p className="text-sm text-muted-foreground">{store.phone}</p>
                <p className="text-sm text-muted-foreground">{store.hours}</p>
                <div className="pt-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default StoreMap;
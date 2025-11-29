import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMap } from '@fortawesome/free-solid-svg-icons'
import 'leaflet/dist/leaflet.css'

// Fix for missing marker icons in some Vite setups
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const MapView = () => {
  const position: [number, number] = [44.367417503363825, -91.31645564767399]

  return (
    <div className="map-view">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={DefaultIcon}>
          <Popup>
            <strong>Sample Marker</strong><br />
            You can click me!
          </Popup>
        </Marker>
      </MapContainer>
      {/* <div className="map-controls flex flex--justify-space-between gap-1">
        <button className="btn btn-primary">Add Trail</button>
        
        <button className="btn btn-secondary">Edit Trail</button>
      </div> */}
    </div>
  )
}

export default MapView

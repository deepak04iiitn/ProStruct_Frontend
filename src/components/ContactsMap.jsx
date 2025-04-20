import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const roleConfig = {
  'Contractor': { color: '#3388ff', shape: 'star', offset: [-10, -10] },
  'Home Owner': { color: '#33cc33', shape: 'home', offset: [10, -10] },
  'Affiliate': { color: '#ffcc00', shape: 'circle', offset: [-10, 10] },
  'Referral Partner': { color: '#9933cc', shape: 'diamond', offset: [10, 10] },
  'Community Partner': { color: '#ff9900', shape: 'square', offset: [0, -15] },
  'Geo Tech': { color: '#ff66cc', shape: 'triangle', offset: [0, 15] }
};

function ContactsMap({ contacts, projectRoles }) {
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  const processRoles = (contact) => {
   
    const processedRoles = [];
    
    if (Array.isArray(contact.projectRoles)) {
      contact.projectRoles.forEach(role => {
        
        if(role.includes(';')) {
          const subRoles = role.split(';').map(r => r.trim());
          processedRoles.push(...subRoles);
        } 
        else if(role.includes(':')) {
          const subRoles = role.split(':').map(r => r.trim());
          processedRoles.push(...subRoles);
        } 
        else{
          processedRoles.push(role.trim());
        }
      });
    } else if (typeof contact.projectRoles === 'string') {
      
      let roles = contact.projectRoles
        .split(/[,;:]/)
        .map(role => role.trim())
        .filter(role => role.length > 0);
      
      processedRoles.push(...roles);
    }
    
    return processedRoles;
  };

  
  const createMarkerIcon = (role) => {
    
    let config = roleConfig[role];
    
    
    if (!config) {
      const normalizedRole = role.trim();
      const matchingRole = Object.keys(roleConfig).find(key => 
        key.toLowerCase() === normalizedRole.toLowerCase()
      );
      
      if (matchingRole) {
        config = roleConfig[matchingRole];
      } else {
        
        config = { color: '#808080', shape: 'circle', offset: [0, 0] };
        console.warn(`Unknown role encountered: "${role}". Using default icon.`);
      }
    }
    
    const svgString = createSVG(config.shape, config.color);
    
    return new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(svgString),
      iconSize: [24, 24], 
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  
  const createSVG = (shape, color) => {
    const size = 24;
    const halfSize = size / 2;
    
    let shapeSVG = '';
    switch (shape) {
      case 'star':
        const points = [
          [halfSize, 0],
          [halfSize * 0.7, halfSize * 0.7],
          [0, halfSize * 0.8],
          [halfSize * 0.6, halfSize * 1.2],
          [halfSize * 0.4, size],
          [halfSize, halfSize * 1.4],
          [halfSize * 1.6, size],
          [halfSize * 1.4, halfSize * 1.2],
          [size, halfSize * 0.8],
          [halfSize * 1.3, halfSize * 0.7]
        ].map(point => point.join(',')).join(' ');
        shapeSVG = `<polygon points="${points}" fill="${color}" stroke="white" stroke-width="2" />`;
        break;
        
      case 'triangle':
        shapeSVG = `<polygon points="${halfSize},0 ${size},${size} 0,${size}" fill="${color}" stroke="white" stroke-width="2" />`;
        break;
        
      case 'square':
        shapeSVG = `<rect x="0" y="0" width="${size}" height="${size}" fill="${color}" stroke="white" stroke-width="2" />`;
        break;
        
      case 'diamond':
        shapeSVG = `<polygon points="${halfSize},0 ${size},${halfSize} ${halfSize},${size} 0,${halfSize}" fill="${color}" stroke="white" stroke-width="2" />`;
        break;
        
      case 'home':
        shapeSVG = `
          <polygon points="${halfSize},0 ${size},${halfSize} ${size},${size} 0,${size} 0,${halfSize}" fill="${color}" stroke="white" stroke-width="2" />
          <rect x="${size/3}" y="${size*0.6}" width="${size/3}" height="${size*0.4}" fill="white" />
        `;
        break;
        
      case 'circle':
      default:
        shapeSVG = `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize-1}" fill="${color}" stroke="white" stroke-width="2" />`;
        break;
    }
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapeSVG}</svg>`;
  };
  
  const RoleBadge = ({ role }) => (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
      {role}
    </span>
  );

  
  const calculateMarkerPosition = (contact, role, roleIndex, totalRoles) => {
    const config = roleConfig[role] || { offset: [0, 0] };
    
    
    if (totalRoles > 1) {
      const offsetFactor = 0.001; 
      return [
        contact.coordinates.lat + (config.offset[1] * offsetFactor),
        contact.coordinates.lng + (config.offset[0] * offsetFactor)
      ];
    }
    
    return [contact.coordinates.lat, contact.coordinates.lng];
  };

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {contacts.map(contact => {
          
          const roles = processRoles(contact);
          
          
          const popupContent = (
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-lg">{contact.name}</h3>
              
              <div className="mt-2">
                {roles.map(role => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
              
              {contact.email && (
                <p className="mt-2">
                  <strong>Email:</strong> {contact.email}
                </p>
              )}
              
              {contact.phone && (
                <p className="mt-1">
                  <strong>Phone:</strong> {contact.phone}
                </p>
              )}
              
              {contact.address && (
                <p className="mt-1">
                  <strong>Address:</strong> {contact.address}
                </p>
              )}
            </div>
          );
          
          
          return (
            <LayerGroup key={contact.id}>
              {roles.map((role, index) => (
                <Marker
                  key={`${contact.id}-${role}`}
                  position={calculateMarkerPosition(contact, role, index, roles.length)}
                  icon={createMarkerIcon(role)}
                  zIndexOffset={1000 + index}
                >
                  
                  {index === 0 && <Popup>{popupContent}</Popup>}
                </Marker>
              ))}
            </LayerGroup>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ContactsMap;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContactsMap from './components/ContactsMap';
import Filters from './components/Filters';
import MapLegend from './components/MapLegend';
import ContactSuggestions from './components/ContactSuggestions';
import { geocodeAddress } from './utils/geocoding';


const RoleIcon = ({ role }) => {
  const roleIcons = {
    'Contractor': { color: '#3388ff', shape: 'star' },
    'Home Owner': { color: '#33cc33', shape: 'home' },
    'Affiliate': { color: '#ffcc00', shape: 'circle' },
    'Referral Partner': { color: '#9933cc', shape: 'diamond' },
    'Community Partner': { color: '#ff9900', shape: 'square' },
    'Geo Tech': { color: '#ff66cc', shape: 'triangle' }
  };

  const config = roleIcons[role] || { color: '#ff0000', shape: 'circle' };
  const { color, shape } = config;
  const size = 12;
  const halfSize = size / 2;
  
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
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={points} fill={color} stroke="white" strokeWidth="0.5" />
        </svg>
      );
      
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${halfSize},0 ${size},${size} 0,${size}`} fill={color} stroke="white" strokeWidth="0.5" />
        </svg>
      );
      
    case 'square':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x="0" y="0" width={size} height={size} fill={color} stroke="white" strokeWidth="0.5" />
        </svg>
      );
      
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${halfSize},0 ${size},${halfSize} ${halfSize},${size} 0,${halfSize}`} fill={color} stroke="white" strokeWidth="0.5" />
        </svg>
      );
      
    case 'home':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${halfSize},0 ${size},${halfSize} ${size},${size} 0,${size} 0,${halfSize}`} fill={color} stroke="white" strokeWidth="0.5" />
          <rect x={size/3} y={size*0.6} width={size/3} height={size*0.4} fill="white" />
        </svg>
      );
      
    case 'circle':
    default:
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={halfSize} cy={halfSize} r={halfSize-0.5} fill={color} stroke="white" strokeWidth="0.5" />
        </svg>
      );
  }
};

function App() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');

  const projectRoles = [
    'Contractor',
    'Home Owner',
    'Affiliate',
    'Referral Partner',
    'Community Partner',
    'Geo Tech'
  ];

  const roleIcons = {
    'Contractor': { color: '#3388ff', shape: 'star' },
    'Home Owner': { color: '#33cc33', shape: 'home' },
    'Affiliate': { color: '#ffcc00', shape: 'circle' },
    'Referral Partner': { color: '#9933cc', shape: 'diamond' },
    'Community Partner': { color: '#ff9900', shape: 'square' },
    'Geo Tech': { color: '#ff66cc', shape: 'triangle' }
  };

  const processRoles = (roleString) => {
    if (!roleString) return [];
    
    const roles = roleString
      .split(/[,;:]/)
      .map(role => role.trim())
      .filter(role => role.length > 0);
    
    return roles;
  };

  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching contacts from HubSpot API via backend proxy...');
        
        const response = await axios.get('http://localhost:3000/api/hubspot/contacts');
        
        console.log('HubSpot API response:', response);
        
        if (!response.data || !response.data.results) {
          throw new Error('Invalid response format from HubSpot API');
        }
        
        const hubspotContacts = response.data.results.map(contact => {
          const properties = contact.properties;
          
          let contactRoles = [];
          if (properties.project_role) {
            contactRoles = processRoles(properties.project_role);
          } else {
            const randomRoleIndex = Math.floor(Math.random() * projectRoles.length);
            contactRoles = [projectRoles[randomRoleIndex]];
          }
            
          const name = `${properties.firstname || ''} ${properties.lastname || ''}`.trim();
          const address = properties.address || '';
          
          return {
            id: contact.id,
            name: name || 'Unknown',
            email: properties.email || '',
            phone: properties.phone || '',
            address: address,
            projectRoles: contactRoles
          };
        });
        
        
        const contactsWithCoordinates = [];
        
        for (let i = 0; i < hubspotContacts.length; i++) {
          const contact = hubspotContacts[i];
          try {
            let coordinates;
            if (contact.address) {
              coordinates = await geocodeAddress(contact.address);
            } else {
              coordinates = {
                lat: 37 + (Math.random() * 10 - 5),
                lng: -95 + (Math.random() * 10 - 5)
              };
            }
            
            contactsWithCoordinates.push({
              ...contact,
              coordinates
            });
            

            if (i % 5 === 0 || i === hubspotContacts.length - 1) {
              setContacts([...contactsWithCoordinates]);
              setFilteredContacts([...contactsWithCoordinates]);
            }
          } catch (error) {
            console.error(`Failed to geocode address for ${contact.name}:`, error);
            contactsWithCoordinates.push({
              ...contact,
              coordinates: {
                lat: 37 + (Math.random() * 10 - 5),
                lng: -95 + (Math.random() * 10 - 5)
              }
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
          
          if (error.response.status === 401) {
            setError('Authentication failed. Check your HubSpot token.');
          } else {
            setError(`Failed to load contacts: Status ${error.response.status}`);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError('No response received from API. Check your network connection.');
        } else {
          console.error('Error message:', error.message);
          setError(`Error: ${error.message}`);
        }
        
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);


  useEffect(() => {
    filterContacts();
  }, [selectedRoles, locationFilter, contacts]);


  const filterContacts = () => {
    let filtered = [...contacts];
    
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(contact => {

        if (!contact.projectRoles) return false;
        
        return contact.projectRoles.some(role => selectedRoles.includes(role));
      });
    }
    
    if (locationFilter.trim()) {
      const locationLower = locationFilter.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.address && contact.address.toLowerCase().includes(locationLower)
      );
    }
    
    console.log("Filtered contacts:", filtered.length);
    console.log("Selected roles:", selectedRoles);
    
    setFilteredContacts(filtered);
  };

  // Handle role selection/deselection
  const handleRoleChange = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  // Handle location filter change
  const handleLocationChange = (event) => {
    setLocationFilter(event.target.value);
  };

  if (loading && contacts.length === 0) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-lg">Loading contacts from HubSpot...</div>
    </div>
  );
  
  if (error && contacts.length === 0) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-lg text-red-500">{error}</div>
      <div className="mt-2">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white px-4 py-4">
        <h1 className="text-2xl font-bold">ProStruct Engineering Contacts</h1>
        <p className="text-sm opacity-80">
          {loading && contacts.length > 0 ? 'Loading contacts...' : `Showing ${filteredContacts.length} of ${contacts.length} contacts`}
        </p>
        {error && <p className="text-xs text-red-200 mt-1">{error}</p>}
      </header>
      
      <Filters 
        projectRoles={projectRoles}
        selectedRoles={selectedRoles}
        locationFilter={locationFilter}
        onRoleChange={handleRoleChange}
        onLocationChange={handleLocationChange}
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side: Map and Legend */}
        <div className="relative flex-1 min-h-[400px]">
          {contacts.length > 0 && (
            <ContactsMap 
              contacts={filteredContacts} 
              projectRoles={projectRoles}
            />
          )}
        </div>
        
        {/* Right side: Suggestions and Legend */}
        <div className="w-full md:w-96 flex flex-col overflow-auto">
          {/* Fixed legend at the top */}
          <div className="bg-white p-3 border-b border-gray-200 sticky top-0 z-10">
            <h4 className="text-sm font-bold mb-2">Project Roles</h4>
            <div className="flex flex-wrap gap-2">
              {projectRoles.map(role => {
                const iconConfig = roleIcons[role];
                if (!iconConfig) return null;
                
                return (
                  <div key={role} className="flex items-center mr-2 mb-1">
                    <div className="mr-1">
                      <RoleIcon role={role} />
                    </div>
                    <span className="text-xs">{role}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Scrollable suggestions */}
          <div className="flex-1 overflow-auto">
            <ContactSuggestions 
              contacts={contacts}
              selectedRoles={selectedRoles}
              locationFilter={locationFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';

function ContactSuggestions({ contacts, selectedRoles, locationFilter }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const maxDefaultSuggestions = 3;
  

  const roleConfig = {
    'Contractor': { color: '#3388ff', shape: 'star' },
    'Home Owner': { color: '#33cc33', shape: 'home' },
    'Affiliate': { color: '#ffcc00', shape: 'circle' },
    'Referral Partner': { color: '#9933cc', shape: 'diamond' },
    'Community Partner': { color: '#ff9900', shape: 'square' },
    'Geo Tech': { color: '#ff66cc', shape: 'triangle' }
  };
  
  
  useEffect(() => {
    if (contacts.length === 0) {
      setSuggestions([]);
      return;
    }
    
    
    const extractCity = (address) => {
      if (!address) return '';
      
      
      const parts = address.split(',');
      if (parts.length >= 2) {
        return parts[parts.length - 2].trim();
      }
      return '';
    };
    
    
    const calculateRelevance = (contact) => {
      let score = 0;
      
      
      if(selectedRoles.length > 0) {
        const roleMatch = contact.projectRoles.some(role => selectedRoles.includes(role));
        if (roleMatch) score += 5;
      } else {
        score += 1;
      }
      
      // Location match
      if (locationFilter.trim()) {
        const locationLower = locationFilter.toLowerCase();
        if (contact.address && contact.address.toLowerCase().includes(locationLower)) {
          score += 3;
        }
      } else {
        score += 1;
      }
      
      if (contact.email) score += 1;
      if (contact.phone) score += 1;
      
      return score;
    };
    

    const relevantContacts = contacts
      .map(contact => ({
        ...contact,
        relevance: calculateRelevance(contact),
        city: extractCity(contact.address)
      }))
      .filter(contact => contact.relevance > 1)
      .sort((a, b) => b.relevance - a.relevance);
    
    setSuggestions(relevantContacts);
  }, [contacts, selectedRoles, locationFilter]);
  
  
  const RoleIcon = ({ role }) => {
    const config = roleConfig[role] || { color: '#ff0000', shape: 'circle' };
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
  
  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No suggestions available with current filters.
      </div>
    );
  }
  
  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, maxDefaultSuggestions);
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Suggested Contacts</h3>
      
      <ul className="space-y-2">
        {displayedSuggestions.map(contact => {
          const location = contact.city || 'the area';
          
          return (
            <li key={contact.id} className="bg-white p-3 rounded shadow-sm border border-blue-100">
              <p className="text-blue-800">
                You can contact <span className="font-semibold">{contact.name}</span> in {location} as 
                {contact.projectRoles.map((role, idx) => (
                  <span key={idx} className="ml-1">
                    {idx > 0 && (idx === contact.projectRoles.length - 1 ? ' and ' : ', ')}
                    <span className="inline-flex items-center">
                      <span className="inline-block mr-1" style={{ verticalAlign: 'middle' }}>
                        <RoleIcon role={role} />
                      </span>
                      {role}
                    </span>
                  </span>
                ))}
                .
              </p>
              <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4">
                {contact.email && (
                  <span className="inline-flex items-center">
                    <span className="mr-1">📧</span> {contact.email}
                  </span>
                )}
                {contact.phone && (
                  <span className="inline-flex items-center">
                    <span className="mr-1">📞</span> {contact.phone}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      
      {suggestions.length > maxDefaultSuggestions && (
        <button 
          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show fewer suggestions' : `Show ${suggestions.length - maxDefaultSuggestions} more suggestions`}
        </button>
      )}
    </div>
  );
}

export default ContactSuggestions;
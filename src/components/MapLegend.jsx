import React from 'react';

const MapLegend = ({ projectRoles }) => {
  const roleConfig = {
    'Contractor': { color: '#3388ff', shape: 'star' },
    'Home Owner': { color: '#33cc33', shape: 'home' },
    'Affiliate': { color: '#ffcc00', shape: 'circle' },
    'Referral Partner': { color: '#9933cc', shape: 'diamond' },
    'Community Partner': { color: '#ff9900', shape: 'square' },
    'Geo Tech': { color: '#ff66cc', shape: 'triangle' }
  };

  const createMiniIcon = (shape, color) => {
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

  return (
    <div className="absolute bottom-5 right-5 bg-white p-3 rounded shadow-md z-10">
      <h4 className="text-sm font-bold mb-2">Project Roles</h4>
      {projectRoles.map(role => {
        const config = roleConfig[role];
        if (!config) return null;
        
        return (
          <div key={role} className="flex items-center mb-1">
            <div className="mr-2">
              {createMiniIcon(config.shape, config.color)}
            </div>
            <span className="text-sm">{role}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MapLegend;
import React from 'react';

function Filters({ 
  projectRoles, 
  selectedRoles, 
  locationFilter, 
  onRoleChange, 
  onLocationChange 
}) {
  return (
    <div className="bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">Filter by Role</h3>
          <div className="flex flex-wrap gap-2">
            {projectRoles.map(role => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedRoles.includes(role)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">Filter by Location</h3>
          <input
            type="text"
            value={locationFilter}
            onChange={onLocationChange}
            placeholder="Enter city, state, or zip"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
}

export default Filters;
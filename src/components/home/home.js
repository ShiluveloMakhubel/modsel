import React, { useState } from 'react';
import './home.css';
const Homepage = () => {
  // Mock data for available modules
  const initialModules = [
    { id: 1, name: "Introduction to Cloud Security", description: "Learn the fundamentals of securing cloud environments." },
    { id: 2, name: "Advanced Networking", description: "Covers advanced topics in cloud network structures." },
    { id: 3, name: "Data Protection and Privacy", description: "Explore data protection laws and techniques in cloud computing." }
  ];

  // State for available modules and registered modules
  const [availableModules, setAvailableModules] = useState(initialModules);
  const [registeredModules, setRegisteredModules] = useState([]);

  // Function to handle registering for a module
  const handleRegister = module => {
    // Add to registered modules
    setRegisteredModules(prev => [...prev, module]);
    // Remove from available modules
    setAvailableModules(prev => prev.filter(m => m.id !== module.id));
  };

  return (
    <div className="homepage">
      <h1>Select Modules</h1>
      <div>
        <h2>Available Modules</h2>
        <ul>
          {availableModules.map(module => (
            <li key={module.id}>
              {module.name} - {module.description}
              <button onClick={() => handleRegister(module)}>Register</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Registered Modules</h2>
        <ul>
          {registeredModules.map(module => (
            <li key={module.id}>{module.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Homepage;

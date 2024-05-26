import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.css';

const Homepage = ({ userId }) => {
  const [availableModules, setAvailableModules] = useState([]);
  const [registeredModules, setRegisteredModules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered with userId:", userId);
    const fetchModules = async () => {
      try {
        console.log("Fetching modules and user registered modules...");
        const [modulesResponse, userModulesResponse] = await Promise.all([
          axios.get('http://localhost:8000/modules'),
          axios.get(`http://localhost:8000/user_modules/${userId}`)
        ]);

        const allModules = modulesResponse.data;
        const userRegisteredModules = userModulesResponse.data;

        console.log("All Modules:", allModules);
        console.log("User Registered Modules:", userRegisteredModules);

        const registeredModuleIds = new Set(userRegisteredModules.map(module => module.Moduleid));
        const availableModules = allModules.filter(module => !registeredModuleIds.has(module.Moduleid));

        setAvailableModules(availableModules);
        setRegisteredModules(userRegisteredModules);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Error fetching modules. Please try again later.');
      }
    };

    if (userId) {
      fetchModules();
    }
  }, [userId]);

  const handleRegister = async (module) => {
    console.log(`Registering module: ${module.name} with ID: ${module.Moduleid}`);
    try {
      const response = await axios.post('http://localhost:8000/add_user_module', {
        Userid: userId,
        Moduleid: module.Moduleid
      });
      console.log('Response from server:', response.data);

      console.log('Module registered successfully:', module.name);
      setRegisteredModules(prev => [...prev, module]);
      setAvailableModules(prev => prev.filter(m => m.Moduleid !== module.Moduleid));
    } catch (error) {
      console.error('Error registering module:', error);
      setError('Error registering module. Please try again later.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="homepage">
      <h1>Select Modules</h1>
      <div className="modules-section">
        <div className="available-modules">
          <h2>Available Modules</h2>
          <ul>
            {availableModules.map(module => (
              <li key={module.Moduleid}>
                {module.name} - {module.description}
                <button onClick={() => handleRegister(module)}>Register</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="registered-modules">
          <h2>Registered Modules</h2>
          <ul>
            {registeredModules.map(module => (
              <li key={module.Moduleid}>{module.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

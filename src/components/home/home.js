import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.css';

const Homepage = ({ userId, role }) => {
  const [availableModules, setAvailableModules] = useState([]);
  const [registeredModules, setRegisteredModules] = useState([]);
  const [newModule, setNewModule] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered with userId:", userId);
    const fetchModules = async () => {
      try {
        console.log("Fetching modules and user registered modules...");
        const [modulesResponse, userModulesResponse] = await Promise.all([
          axios.get('http://ec2-13-50-45-196.eu-north-1.compute.amazonaws.com:8000/modules'),
          axios.get(`http://ec2-13-50-45-196.eu-north-1.compute.amazonaws.com:8000/user_modules/${userId}`)
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
      const response = await axios.post('http://ec2-13-50-45-196.eu-north-1.compute.amazonaws.com:8000/add_user_module', {
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

  const handleRemove = async (module) => {
    console.log(`Removing module: ${module.name} with ID: ${module.Moduleid}`);
    try {
      const response = await axios.post('http://ec2-13-50-45-196.eu-north-1.compute.amazonaws.com:8000/remove_user_module', {
        Userid: userId,
        Moduleid: module.Moduleid
      });
      console.log('Response from server:', response.data);

      console.log('Module removed successfully:', module.name);
      setAvailableModules(prev => [...prev, module]);
      setRegisteredModules(prev => prev.filter(m => m.Moduleid !== module.Moduleid));
    } catch (error) {
      console.error('Error removing module:', error);
      setError('Error removing module. Please try again later.');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    console.log(`Adding new module: ${newModule.name}`);
    try {
      const response = await axios.post('http://ec2-13-50-45-196.eu-north-1.compute.amazonaws.com:8000/add_module', {
        name: newModule.name,
        description: newModule.description
      });
      console.log('Response from server:', response.data);

      console.log('Module added successfully:', newModule.name);
      setAvailableModules(prev => [...prev, response.data]);
      setNewModule({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding module:', error);
      setError('Error adding module. Please try again later.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="homepage">
      <h1>Select Modules</h1>
      {role === 'admin' && (
        <div>
          <h2>Add New Module</h2>
          <form onSubmit={handleAddModule}>
            <div>
              <label>Module Name:</label>
              <input
                type="text"
                value={newModule.name}
                onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Module Description:</label>
              <input
                type="text"
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                required
              />
            </div>
            <button type="submit">Add Module</button>
          </form>
        </div>
      )}
      <div>
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
      <div>
        <h2>Registered Modules</h2>
        <ul>
          {registeredModules.map(module => (
            <li key={module.Moduleid}>
              {module.name}
              <button onClick={() => handleRemove(module)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Homepage;

import { createContext, useContext, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');

    if (adminToken) {
      const decoded = jwtDecode(adminToken);
      if (decoded.role === 'admin') setRole('admin');
    } else if (userToken) {
      const decoded = jwtDecode(userToken);
      setRole(decoded.role || 'user');
    } else {
      setRole(null);
    }
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

"use client"
import { createContext, useState } from 'react';

export const DataContext = createContext();

const ContextProvider = ({ children }) => {
  const [principalId, setPrincipalId] = useState(0);
  const[teacherId, setTeacherId] = useState(7)

  return (
    <DataContext.Provider value={{ principalId, setPrincipalId,teacherId, setTeacherId }}>
      {children}
    </DataContext.Provider>
  );
};

export default ContextProvider;

import React from 'react';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './pages/dashboards';

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
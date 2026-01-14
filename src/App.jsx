import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Overview from './pages/Overview';
import Services from './pages/Services';
import Alerts from './pages/Alerts';
import Resources from './pages/Resources';
import Budgets from './pages/Budgets';
import BudgetForm from './pages/BudgetForm';
import TagCompliance from './pages/TagCompliance';
import Reports from './pages/Reports';
import Simulation from './pages/Simulation';

function App() {
  return (
    <Router>
      <Dashboard>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/services" element={<Services />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/budgets/new" element={<BudgetForm />} />
          <Route path="/compliance" element={<TagCompliance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/simulation" element={<Simulation />} />
        </Routes>
      </Dashboard>
    </Router>
  );
}

export default App;

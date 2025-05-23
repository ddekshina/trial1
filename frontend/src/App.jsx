import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from '../src/routes/FormPage';
import ProjectPipeline from './pages/ProjectPipeline';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/form/:id" element={<FormPage />} />
        <Route path="/projectpipeline" element={<ProjectPipeline />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from '../src/routes/FormPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/form/:id" element={<FormPage />} />
      </Routes>
    </Router>
  );
}

export default App;

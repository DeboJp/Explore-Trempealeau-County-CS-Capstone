import Sidebar from './components/Sidebar'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import Test from './pages/Test'
import Admin from './pages/Administration';
import TrailEditor from './pages/Trails';
import Analytics from './pages/Analytics';
import AppPages from './pages/AppPages';
import AppPageEditor from './pages/AppPageEditor';
import AppPageSearch from './pages/AppPageSearch';
import LogIn from './pages/auth/LogIn';

function App() {
  const loggedIn = true; // Placeholder for actual authentication logic
  
  if (!loggedIn) {
    return(
      <div className="app-container">
        <LogIn />
      </div>
    );
  }
  return (
    <div className="app-container">
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path='trails' element={<TrailEditor />}/>
          <Route path='admin' element={<Admin />}/>
          <Route path='analytics' element={<Analytics />}/>
          <Route path='pages' element={<AppPages />}>
            <Route index element={<AppPageSearch />} />
            <Route path='add' element={<AppPageEditor />} />
            <Route path='edit' element={<AppPageEditor />} />
          </Route>
          <Route path='test' element={<Test />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

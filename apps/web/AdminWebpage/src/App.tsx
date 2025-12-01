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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
          {/* <Sidebar /> */}
          <Routes>
            <Route index element={<ProtectedRoute><Sidebar /><Dashboard /></ProtectedRoute>} />
            <Route path="login" element={<LogIn />} />
            <Route path='trails' element={<ProtectedRoute><Sidebar /><TrailEditor /></ProtectedRoute>} />
            <Route path='admin' element={<ProtectedRoute><Sidebar /><Admin /></ProtectedRoute>} />
            <Route path='analytics' element={<ProtectedRoute><Sidebar /><Analytics /></ProtectedRoute>} />
            <Route path='pages' element={<ProtectedRoute><Sidebar /><AppPages /></ProtectedRoute>}>
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

import DataForm from '../components/TrailEditor'
import MapView from '../components/MapView'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon
import SearchBar from '../components/SearchBar';
import { useAuth } from "react-oidc-context";

const Dashboard = () => {
  // check if user is authenticated
  const auth = useAuth();
  console.log('Auth state:', auth);
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if(!auth.isAuthenticated && localStorage.getItem('access_token') != null) {
    localStorage.removeItem('access_token');
  }
  // if authenticated but access token is not in localStorage, store it
  if (auth.isAuthenticated && localStorage.getItem('access_token') === null) {
    localStorage.setItem('access_token', auth.user?.access_token || '');
  }

  if (auth.isAuthenticated && localStorage.getItem('refresh_token') === null) {
    localStorage.setItem('refresh_token', auth.user?.refresh_token || '');
  }

  return (
    <main className="main-content">
      <div className="flex flex--align-center flex--justify-space-between w-100">
        <h1>Dashboard</h1>
        <SearchBar style={{ position: 'absolute', right: '1rem', top: '3rem' }}/>
      </div>
      <div className="flex flex-col w-100">
        <div className="flex flex-row gap-2 w-100 mb-2">
          <div className="w-50">
            <div className="form-section">
              <DataForm type='widget'/>
            </div>
          </div>
          <div className="w-50 flex flex-col items-center" style={{zIndex: 1}}>
            <div className="map-section w-100">
              <MapView />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Dashboard

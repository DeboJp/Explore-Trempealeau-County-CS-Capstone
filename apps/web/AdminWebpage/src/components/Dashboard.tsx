import DataForm from './DataForm'
import MapView from './MapView'

const Dashboard = () => {
  return (
    <main className="dashboard">
      <h1>Trail Data Entry Dashboard</h1>
      <div className="dashboard-content">
        <div className="form-section">
          <DataForm />
        </div>
        <div className="map-section">
          <MapView />
        </div>
      </div>
    </main>
  )
}

export default Dashboard

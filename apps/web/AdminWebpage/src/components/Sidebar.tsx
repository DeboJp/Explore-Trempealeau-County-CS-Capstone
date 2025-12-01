import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons/faRightFromBracket"
import { NavLink } from 'react-router'
import logo from '../assets/logo.png'

const Sidebar = () => {
  return (
    <aside className="sidebar bg-primary">
      <NavLink to='/'><img src={logo} alt="Trempealeau County" style={{ height: '7.5rem', marginRight: '0.5rem' }} /></NavLink>
      <nav>
        <ul>
          <li><NavLink to='/trails' className={({ isActive }) => isActive ? 'active' : ''}>Trails</NavLink></li>
          <li><NavLink to='/pages' className={({ isActive }) => isActive ? 'active' : ''}>App Pages</NavLink></li>
          <li><NavLink to='/analytics' className={({ isActive }) => isActive ? 'active' : ''}>Analytics</NavLink></li>
          <li><NavLink to='/admin' className={({ isActive }) => isActive ? 'active' : ''}>Administration Settings</NavLink></li>
          <li style={{ display: 'flex', alignItems: 'center', position: 'absolute', bottom: '3rem', left: '1rem', gap: '0.5rem' }}>
            <FontAwesomeIcon icon={faUser} /> Mason <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

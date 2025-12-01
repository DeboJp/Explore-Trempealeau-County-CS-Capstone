import SectionToggle from "../components/SectionToggle";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router";

const AppPageSearch = () => {
    return (
        <div>
        Search for a page, look through the page repository, or create a new page.
        <div className="flex flex--align-center mt-2 mb-2 gap-1">
          <div className='flex flex--align-center search-bar mt-1'>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '0' }} />
              <input type="text" placeholder="Search..." className="bg-light w-100 h-100" style={{borderWidth: 0}} />
          </div>
          <button className="btn btn--primary ml-1" style={{marginTop: '0.75rem'}}>Search</button>
          <NavLink to='/pages/add' className="btn btn--secondary ml-1" style={{marginTop: '0.75rem'}}>Create new</NavLink>
        </div>
      </div>
    )
}

export default AppPageSearch;
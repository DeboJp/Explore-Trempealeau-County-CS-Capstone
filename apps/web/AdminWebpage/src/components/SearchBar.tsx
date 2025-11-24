import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon
import { useState } from 'react';
import { NavLink } from "react-router";
import parks from '../data/locations/PublicParks.json';
import settings from '../data/settings.json'

interface SearchBarProps {
    style?: React.CSSProperties;
}
  
const SearchBar = ({ style }: SearchBarProps) => {
    const [input, setInput] = useState('')
    const [results, setResults] = useState([])

    const lookup = (e) => {
      // search all_data
      setInput(e.target.value)
      console.log(e.target.value)
      // Perform search logic here
      let searchResults = parks.features.filter(item => (item.attributes != null) && (item.attributes.Name != null) && item.attributes.Name.toLowerCase().includes(e.target.value.toLowerCase()))
      searchResults = searchResults.sort((a, b) => a.attributes.Name.localeCompare(b.attributes.Name))
      // only select OBJECTID, Label_Proper
      searchResults = searchResults.map(item => ({
        attributes: {
          SOURCE: 'Location',
          OBJECTID: item.attributes.OBJECTID,
          Name: item.attributes.Name
        }
      }))
      // distinct results by Name
      searchResults = searchResults.filter((item, index, self) => {
        return index === self.findIndex((t) => t.attributes.Name === item.attributes.Name);
      })
      console.log(settings.settings)
      let settingsResults = settings.settings.filter(item => item.label.toLowerCase().includes(e.target.value.toLowerCase()))
      settingsResults = settingsResults.forEach(item => {
        searchResults.unshift({
          attributes: {
            SOURCE: 'Settings',
            OBJECTID: -1,
            Name: item.label
          }
        })
      })
      searchResults = searchResults.slice(0, 5)
      setResults(searchResults)
    }
    return (
      <div style={style}>
          <div className='flex flex--align-center search-bar'>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '0' }} />
            <input type="text" placeholder="Search..." className="bg-light w-100 h-100" style={{borderWidth: 0}} value={input} onChange={lookup} />
          </div>
          {input.length > 0 && results.length > 0 && (
            <div className="search-results bg-light">
                {results.map((result, index) => (
                  <NavLink  className="result" to={result.attributes.SOURCE === 'Location' ? `/pages/edit?location=${result.attributes.OBJECTID}` : `/settings`}><div key={index}><span style={{fontWeight: '300', opacity: '0.8'}}>{result.attributes.SOURCE} &gt;</span> {result.attributes.Name}</div></NavLink>
                ))}
            </div>
          )}
      </div>
    )
}

export default SearchBar;
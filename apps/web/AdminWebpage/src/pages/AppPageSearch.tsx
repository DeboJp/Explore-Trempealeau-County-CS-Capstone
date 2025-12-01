import React, {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router";
import PageService from "../services/PageService";
import SectionToggle from '../components/SectionToggle';


const AppPageSearch = () => {
    const service = PageService;
    const [pages, setPages] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterData, setFilterData] = useState<any>({
        city: '',
        type: '',
        published: false
    });

    useEffect(() => {
        async function fetchPages() {
            const pagesData = await service.getPages(localStorage.getItem('access_token') || '');
            // paginate and sort pages by most recent
            setPages(pagesData.pages.sort((a: number, b: number) => b.id - a.id));
        }
        fetchPages();
    }, []);

    async function handleSearch() {
        const query = searchQuery;
        if(query.trim().length === 0 && filterData.city === '' && filterData.type === '' && !filterData.published) {
            const pagesData = await service.getPages(localStorage.getItem('access_token') || '');
            setPages(pagesData.pages.sort((a: number, b: number) => b.id - a.id));
            return;
        }

        const results = await PageService.search(query, filterData.city, filterData.type, filterData.published);
        setPages(results.pages);
    }

    return (
        <div>
        Search for a page, look through the page repository, or create a new page.
        <div className="flex flex--align-center mt-2 mb-2 gap-1">
          <div className='flex flex--align-center search-bar mt-1'>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '0' }} />
              <input type="text" placeholder="Search..." className="bg-light w-100 h-100" style={{borderWidth: 0}} onChange={(e) => { setSearchQuery(e.target.value); }} />
          </div>
          <button className="btn btn--primary ml-1" style={{marginTop: '0.75rem'}} onClick={handleSearch}>Search</button>
          <NavLink to='/pages/add' className="btn btn--secondary ml-1" style={{marginTop: '0.75rem'}}>Create new</NavLink>
        </div>
        <div className="mt-1">
          <SectionToggle sectionTitle="Filter">
            {/* Add filter options here in the future */}
            <div className="flex flex-col field-group">
              <label htmlFor="filter-category-city">City</label>
              <select id="filter-category-city" name="filter-category-city" value={filterData.city} onChange={(e) => setFilterData({...filterData, city: e.target.value})}>
                <option value="">All Cities</option>
                <option value="trempealeau">Trempealeau</option>
                <option value="eleva">Eleva</option>
                <option value="galesville">Galesville</option>
              </select>              
            </div>
            <div className="flex flex-col field-group mt-0-5">
              <label htmlFor="filter-category-type">Type</label>
              <select id="filter-category-type" name="filter-category-type" value={filterData.type} onChange={(e) => setFilterData({...filterData, type: e.target.value})}>
                <option value="">All Types</option>
                <option value="park">Park</option>
                <option value="wildlife">Wildlife</option>
              </select>              
            </div>
            <div className="flex field-group mt-0-5 mb-1">
              <label htmlFor="filter-category-pub">Published</label>
              <input type="checkbox" id="filter-category-pub" name="filter-category-pub" checked={filterData.published} onChange={(e) => {setFilterData({...filterData, published: e.target.checked})}} />
            </div>
          </SectionToggle>
        </div>
        <div className="mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>
                  
                </th>
              </tr>
            </thead>
            <tbody>
            {pages && pages.map((page) => (
              <tr key={page.id} className="border-bottom pb-2 mb-2">
                    <td>{page.title}</td>
                    <td>
                      <NavLink to={`/pages/edit?id=${page.id}&title=${encodeURIComponent(page.title)}`} state={{ pageId: page.id }} className="btn btn--primary">Edit Page</NavLink>
                    <button className="btn btn--secondary ml-1" style={{marginTop: '0.75rem'}} onClick={async () => {
                      const response = await PageService.deletePage(page.id, page.title, `Bearer ${localStorage.getItem('access_token')}`);
                      if(response){
                        setPages(pages.filter(p => p.id !== page.id));
                      }
                    }}>Delete Page</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    )
}

export default AppPageSearch;
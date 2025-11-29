import React, {useState} from "react";
import SectionToggle from "../components/SectionToggle";
import FormArea from "../components/FormArea";
import { useSearchParams } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip'
import parks from '../data/locations/PublicParks.json'; // temp. data


function AppPageEditor() {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    city: '',
    description: '',
    image: null,
    gisId: ''
  });
  const [categories, setCategories] = useState([]);

  const addCategoryForm = (e) => {
    // Append a new category form area
    e.preventDefault();
    setCategories([...categories, { name: `Category ${categories.length + 1}`, content: '' }]);
  }

  // check if location exists
  // TODO: API call to check if GIS ID exists in page database
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('location');
  if (locationId && formData.gisId === '') {
      const location = parks.features.find(feature => feature.attributes.OBJECTID === parseInt(locationId));
      if (location) {
        setFormData({ ...formData, gisId: locationId, title: location.attributes.Name });
      } else {
        setFormData({ ...formData, gisId: locationId });
      }
  }
  if(false){
    // parse XML data and populate form

    // setFormData({...});
    // setCategories([...]);

  }

  const removeCategoryForm = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  }

  const categoriesFormAreas = categories.map((category, index) => (
    <FormArea key={index} width="75%" style={{ padding: '1rem', marginBottom: '1rem' }} title={category.name.length > 0 ? category.name : `Category ${index + 1}`}>
        <div className="flex flex-col field-group">
          <label htmlFor={`category-name-${index}`} className="label label--required">Category Name</label>
          <input type="text" id={`category-name-${index}`} placeholder="Category Name" name={`category-name-${index}`} className="input input--text w-50" value={category.name} onChange={(e) => {
            const newCategories = [...categories];
            newCategories[index].name = e.target.value;
            setCategories(newCategories);
          }} />
        </div>
        <div className="flex flex-col field-group mt-1">
          <label htmlFor={`category-content-${index}`} className="label label--required">Category Content</label>
          <textarea id={`category-content-${index}`} placeholder="Category Content" name={`category-content-${index}`} className="input input--text w-75" value={category.content} onChange={(e) => {
            const newCategories = [...categories];
            newCategories[index].content = e.target.value;
            setCategories(newCategories);
          }}/>
        </div>
        <button className="btn btn--secondary mt-1" onClick={(e) => {
          e.preventDefault();
          removeCategoryForm(index);
        }}>Remove Category</button>
    </FormArea>
  )); 
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Function to parse form data before submission
    const dataToSubmit = {
      ...formData,
      categories: categories
    };
    console.log('Submitting data:', dataToSubmit);
    // Submit logic goes here
    // construct XML
    var xml = '<page>';
    xml += `<title>${dataToSubmit.title}</title>`;
    xml += `<type>${dataToSubmit.type}</type>`;
    xml += `<city>${dataToSubmit.city}</city>`;
    xml += `<description>${dataToSubmit.description}</description>`;
    xml += `<gisId>${dataToSubmit.gisId}</gisId>`;
    dataToSubmit.categories.forEach((category, index) => {
      xml += `<category>`;
      xml += `<name>${category.name}</name>`;
      xml += `<content>${category.content}</content>`;
      xml += `</category>`;
    });
    xml += '</page>';
    console.log(xml);
  }

  return (
      <div className="flex flex--justify-space-between w-100">
        <form className="w-100">
          <FormArea width="75%" style={{ padding: '1rem', marginBottom: '1rem' }} title="Content">
              <div className="flex flex-col field-group">
                <label htmlFor="page-title" className="label label--required">Title</label>
                <input type="text" id="page-title" placeholder="Title" name="page-title" className="input input--text w-50" value={formData.title} onChange={(e) => {setFormData({...formData, title: e.target.value});}}/>
              </div>
              <div className="flex flex-col field-group mt-1">
                <label htmlFor="page-type" className="label label--required">Page Type</label>
                <select id="page-type" name="page-type" className="input input--text w-50" value={formData.type} onChange={(e) => {setFormData({...formData, type: e.target.value});}}>
                  <option value="">Select type</option>
                  <option value="trail">Trail</option>
                  <option value="park">Park</option>
                  <option value="business">Business</option>
                  <option value="community">Community</option>
                  <option value="water">Water</option>
                </select>
              </div>
              <div className="flex flex-col field-group mt-1">
                <label htmlFor="page-city" className="label label--required">City</label>
                <select id="page-city" name="page-city" className="input input--text w-50" value={formData.city} onChange={(e) => {setFormData({...formData, city: e.target.value});}}>
                  <option value="">Select city</option>
                  <option value="trempealeau">Trempealeau</option>
                  <option value="eleva">Eleva</option>
                  <option value="galesville">Galesville</option>
                  <option value="blair">Blair</option>
                  <option value="whitehall">Whitehall</option>
                  <option value="arcadia">Arcadia</option>
                  <option value="strum">Strum</option>
                  <option value="westby">Westby</option>
                  <option value="ettrick">Ettrick</option>
                  <option value="caledonia">Caledonia</option>
                  <option value="washington">Washington</option>
                </select>
              </div>
              <div className="flex flex-col field-group mt-1">
                <label htmlFor="page-description" className="label label--required">Description</label>
                <textarea id="page-description" placeholder="Description" name="page-description" className="input input--text w-75" value={formData.description} onChange={(e) => {setFormData({...formData, description: e.target.value})}}/>
              </div>
              <div className="flex flex-col field-group mt-1">
                <label htmlFor="page-image" className="label label--required">Image</label>
                <input type="file" id="page-image" name="page-image" className="input input--text w-50" onChange={(e) => {setFormData({...formData, image: e.target.files[0]});}} />
              </div>
              <div className="flex flex-col field-group mt-1">
                <div className="flex">
                  <label htmlFor="page-gis" className="label label--required">GIS ID</label>
                  <a className="tooltip gis-tooltip"><FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '16px', marginLeft: '0.5rem' }} /></a>
                  <Tooltip anchorSelect=".gis-tooltip" place="right">
                      <div style={{ maxWidth: '200px', textWrap: 'break-word' }}>
                          The GIS ID is a unique identifier for geographic features for locations such as parks and trails. It is used to connect app pages to GIS data to use for mapping and calculating nearby locations.
                      </div>
                  </Tooltip>
                </div>
                <input type="text" id="page-gis" placeholder="ID" name="page-gis" className="input input--text w-50" value={formData.gisId} onChange={(e) => {setFormData({...formData, gisId: e.target.value});}} />
              </div>
          </FormArea>
          {categoriesFormAreas}
          <div className="flex flex--align-center mt-2 mb-2 gap-1">
              <button className="btn btn--primary" style={{marginTop: '0.75rem'}} onClick={(e) => {addCategoryForm(e)}}>Add a Category</button>
              <a className="tooltip category-tooltip"><FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '20px', marginLeft: '0.5rem', marginTop: '0.75rem' }} /></a>
              <Tooltip anchorSelect=".category-tooltip" place="right">
                  <div style={{ maxWidth: '200px', textWrap: 'break-word' }}>
                      Categories appear on the app page as a tag at the top of the page. Content entered below will appear when each tag is selected by the user on the app. Some examples of categories can be "Camping", "Hiking", and "Fishing".
                  </div>
              </Tooltip>
          </div>
          <button className="btn btn--primary mt-1" onClick={(e) => handleSubmit(e)}>Save</button>
      </form>
      <div className="w-75">
        {/* Preview Section */}
        <h2>Preview</h2>
        <div className="emulator">
          <div className="image">
            {formData.image ? <img src={URL.createObjectURL(formData.image)} alt="Page" /> : <div>Image Preview</div>}
          </div>
          <div style={{paddingLeft: '24px', paddingRight: '24px'}}>
            <div className="flex flex--justify-space-between align-items--center" style={{marginTop: '1rem', marginBottom: '1rem'}}>
              <h3 style={{fontWeight: '400', fontSize: '24px', marginBlock: 0}}>{formData.title || 'Page Title'}</h3>
            </div>
            {categories.length > 0 &&
              <div className="flex gap-1" style={{textAlign: 'center',height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: '1rem'}}>
                {categories.map((category, index) => (
                  <div key={index} style={{color: 'white', width: 'fit-content', fontSize: '12px' }}>
                    <h4 style={{ backgroundColor: '#63B25F', borderRadius: '12px', padding: '6px 12px', fontWeight: 400, fontSize: '14px'}}>{category.name || `Category ${index + 1}`}</h4>
                  </div>
                ))}
              </div>
            }
            <p style={{paddingRight: 24, wordWrap: 'break-word'}}>{formData.description || 'Page description will appear here.'}</p>
          </div>
        </div>  
      </div>
    </div>
  )
}

export default AppPageEditor;
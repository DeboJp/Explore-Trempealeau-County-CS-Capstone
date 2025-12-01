import React, {useEffect, useState} from "react";
import SectionToggle from "../components/SectionToggle";
import FormArea from "../components/FormArea";
import { useSearchParams } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip'
import parks from '../data/locations/PublicParks.json'; // temp. data
import PageService from "../services/PageService";
import FormControl from "../components/FormControl";
import AWS from 'aws-sdk';


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
  const [isPublished, setIsPublished] = useState(false);
  const [visualizerImg, setVisualizerImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const uploadImageToS3 = async (file) => {
    const token = localStorage.getItem('access_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL; // Ensure this is set

    // 1. Get Presigned URL from Backend
    const presignResponse = await fetch(`${apiBase}/pages/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Authorized request
      },
      body: JSON.stringify({
        file_name: file.name,
        content_type: file.type
      })
    });

    console.log('Presign response status:', presignResponse);
    const { upload_url, final_file_url } = await presignResponse.json();

    // 2. Upload File directly to S3 using the Presigned URL
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    
    return final_file_url;
  };

  const addCategoryForm = (e) => {
    // Append a new category form area
    e.preventDefault();
    setCategories([...categories, { name: `Category ${categories.length + 1}`, content: '' }]);
  }

  
  
  const [searchParams] = useSearchParams();
  const pageId = searchParams.get('id');
  const title = searchParams.get('title');
  useEffect(() => {
    async function fetchPageData() {
      if (pageId && title) {
        setIsLoading(true);
        try {
          const pageData = await PageService.getPage(parseInt(pageId), title);
          setIsPublished(pageData.published || false);
          let pageContent = pageData.pageContent ? JSON.parse(pageData.pageContent) : {};
          setFormData({...formData,
            title: pageData.title || '',
            type: pageContent.type.toLowerCase() || '',
            city: pageContent.city.toLowerCase() || '',
            description: pageContent.description || '',
            gisId: pageContent.gisId || '',
          });
          if (pageContent.image) {
            setFormData(prevData => ({...prevData, image: pageContent.image}));
            setVisualizerImg(pageContent.image);
          }

          // parse categories from pageContent JSON
          if(pageContent.categories) {
            setCategories(pageContent.categories);
          }
          setIsLoading(false);
        }
        catch (error) {
          console.error('Error fetching page data:', error);
          setIsLoading(false);
        }
      }
    }
    fetchPageData();
  }, [pageId, title]);

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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Function to parse form data before submission
    const dataToSubmit = {
      ...formData,
      image: formData.image,
      categories: categories
    };
    console.log('Submitting data:', dataToSubmit);
    // Submit logic goes here
    // construct XML
    let json = dataToSubmit
    // add categories
    json.categories = categories.map((category) => ({
      name: category.name,
      content: category.content
    }));
    json = JSON.stringify(json);

    try {
      if(pageId && title) {
        // Update existing page logic (not implemented in PageService yet)
        const response = await PageService.updatePage(parseInt(pageId), title, {
          'pageContent': json,
        }, localStorage.getItem('access_token') || '');
      } else {
        // Add new page
        const idx = await PageService.getPagesCount().then(data => data.count + 1);
        const data = {
            'id': idx,
            'title': dataToSubmit.title,
            'pageContent': json,
          };

        const response = await PageService.addPage(data, localStorage.getItem('access_token') || '');
      }
      // redirect to page search after successful submission
      window.location.href = '/pages';
    } catch (error) {
      console.error('Error submitting page:', error);
    }
  }

  const handlePublish = async (e) => {
    if(pageId && title) {
      e.preventDefault();
      try {
        const response = await PageService.publishPage(parseInt(pageId), title, localStorage.getItem('access_token') || '');
        setIsPublished(true);
      } catch (error) {
        console.error('Error publishing page:', error);
      }
    }
  }

  return (
      <div className="flex flex--justify-space-between w-100">
        <form className="w-100">
          <FormArea width="75%" style={{ padding: '1rem', marginBottom: '1rem' }} title="Content">
              <FormControl disabled={searchParams.get('id') !== null && searchParams.get('title') !== null} >
                <div className={"flex flex-col field-group "+ (searchParams.get('id') !== null && searchParams.get('title') !== null ? "bg-light-secondary" : "")}>
                  <div className="flex flex--align-center">
                    <label htmlFor="page-title" className="label label--required">Title</label>
                    {searchParams.get('id') !== null && searchParams.get('title') !== null &&
                      <>
                        <FontAwesomeIcon icon={faLock} style={{ fontSize: '14px', marginLeft: '0.2rem' }} />
                        <a className="tooltip lock-tooltip"><FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '14px', marginLeft: '0.2rem' }} /></a>
                        <Tooltip anchorSelect=".lock-tooltip" place="right">
                            <div style={{ maxWidth: '200px', textWrap: 'break-word' }}>
                                Titles cannot be changed after creation to maintain URL integrity. To change the title, please create a new page with the new title and delete this page.
                            </div>
                        </Tooltip>
                      </>
                    }
                  </div>
                  <input type="text" id="page-title" placeholder="Title" name="page-title" className="input input--text w-50" value={formData.title} onChange={(e) => {setFormData({...formData, title: e.target.value});}}/>
                </div>
              </FormControl>
              <div className="flex flex-col field-group mt-1">
                <label htmlFor="page-type" className="label label--required">Page Type</label>
                <select id="page-type" name="page-type" className="input input--text w-50" value={formData.type} onChange={(e) => {setFormData({...formData, type: e.target.value});}}>
                  <option value="">Select type</option>
                  <option value="trail">Trail</option>
                  <option value="park">Park</option>
                  <option value="business">Business</option>
                  <option value="community">Community</option>
                  <option value="water">Water</option>
                  <option value="wildlife">Wildlife</option>
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
                <input type="file" id="page-image" name="page-image" className="input input--text w-50" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVisualizerImg(URL.createObjectURL(e.target.files[0]));
                    const uploadedImageUrl = await uploadImageToS3(e.target.files[0]);
                    setFormData({...formData, image: uploadedImageUrl});
                  }
                }} />
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
          <div className="flex">
            <button className="btn btn--primary mt-1" onClick={(e) => handleSubmit(e)}>Save</button>
            <button className="btn btn--secondary mt-1 ml-1" onClick={(e) => {handlePublish(e)}} style={{opacity: isPublished ? 0.7 : 1}}>{isPublished ? 'Published' : 'Publish'}</button>
          </div>
      </form>
      <div className="w-75">
        {/* Preview Section */}
        <h2>Preview</h2>
        <div className="emulator">
          <div className="image">
            {visualizerImg ? <img src={visualizerImg} alt="Page" /> : <div>Image Preview</div>}
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
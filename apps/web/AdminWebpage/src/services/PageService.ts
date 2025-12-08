import apiService from "./apiService";

const PageService = {
  getPages: async (authorization?: string) => {
    const response = await apiService.get('/pages', authorization);
    return response.json();
  },

  getPagesCount: async () => {
    const response = await apiService.get('/pages/count');
    return response.json();
  },

  async getPage(pageId: number, title: string, authorization?: string) {
    const response = await apiService.get(`/pages/${pageId}/${encodeURIComponent(title)}`, authorization).then(res => res.json());
    return response;
  },

  addPage: async (pageData: any, authorization?: string) => {
    const response = await apiService.post('/pages', pageData, authorization);
    return response;
  },
  updatePage: async (pageId: number, title: string, pageData: any, authorization?: string) => {
    const response = await apiService.put(`/pages/${pageId}/${title}`, pageData, authorization);
    return response;
  },
  search: async (query: string, city?: string, type?: string, published?: boolean, limit?: number) => {
    const response = await apiService.get(`/pages/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city || '')}&type=${encodeURIComponent(type || '')}&published=${published || false}&limit=${limit || 50}`);
    return response?.json();
  },
  deletePage: async (pageId: number, title: string, authorization?: string) => {
    const response = await apiService.delete(`/pages/${pageId}/${encodeURIComponent(title)}`, authorization);
    return response;
  },
  publishPage: async (pageId: number, title: string, authorization?: string) => {
    const response = await apiService.put(`/pages/publish/${pageId}/${encodeURIComponent(title)}`, {}, authorization);
    return response;
  }
};

export default PageService;
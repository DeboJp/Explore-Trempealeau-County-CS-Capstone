import apiService from "./apiService";
class AnalyticsService {
    get_event_type_data(event_type: string, params?: Record<string, string>) {
        // Placeholder for actual analytics event data retrieval logic
        const uri = new URL(`${apiService.getBaseUrl()}/analytics/event`);
        uri.searchParams.append('event_type', event_type);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                uri.searchParams.append(key, value);
            }
        }
        return apiService.get(uri);
    }
}

export default new AnalyticsService();
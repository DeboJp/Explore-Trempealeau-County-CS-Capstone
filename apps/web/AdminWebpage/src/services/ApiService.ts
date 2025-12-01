import AuthService from "./AuthService";
interface ApiServiceConfig {
    baseUrl: string;
}

class ApiService {
    // API service methods would go here
    private config: ApiServiceConfig;

    constructor() {
        this.config = {
            baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
        };
    }
    getBaseUrl() {
        return this.config.baseUrl;
    }

    async get(endpoint: string | URL, authorization?: string) {
        console.log(`GET Request to: ${this.config.baseUrl}${endpoint}`);
        if( endpoint instanceof URL ) {
            return await fetch(endpoint.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': authorization ? `Bearer ${authorization}` : '',
                }
            });
        }
        try {
            return await fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': authorization ? `Bearer ${authorization}` : '',
                }
            });
        }
        catch (error) {
            // check if error detail contains expired token message
            if(error instanceof Error && error.message.includes('expired')) {
                // trigger token refresh
                console.log('Token expired. Please refresh the token.');
                AuthService.refreshCognitoTokens(
                    import.meta.env.VITE_COGNITO_CLIENT_ID || '',
                    localStorage.getItem('refresh_token') || ''
                ).then(newTokens => {
                    if(newTokens?.AuthenticationResult?.AccessToken) {
                        localStorage.setItem('access_token', newTokens.AuthenticationResult.AccessToken);
                    }
                    if(newTokens?.AuthenticationResult?.RefreshToken) {
                        localStorage.setItem('refresh_token', newTokens.AuthenticationResult.RefreshToken);
                    }
                }).catch((err: Error) => {
                    console.error('Failed to refresh tokens:', err);
                });

            }
            else {
                console.error('Error during GET request:', error);
                throw error;
            }
        }
    }

    post(endpoint: string, data: any, authorization?: string) {
        console.log(`POST Request to: ${this.config.baseUrl}${endpoint}`);
        try{
            return fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization ? `Bearer ${authorization}` : '',
                },
                body: JSON.stringify(data),
            }).then(res => res.json());
        }
        catch (error) {
            // check if error detail contains expired token message
            if(error instanceof Error && error.message.includes('expired')) {
                // trigger token refresh
                console.log('Token expired. Please refresh the token.');
                AuthService.refreshCognitoTokens(
                    import.meta.env.VITE_COGNITO_CLIENT_ID || '',
                    localStorage.getItem('refresh_token') || ''
                ).then(newTokens => {
                    if(newTokens?.AuthenticationResult?.AccessToken) {
                        localStorage.setItem('access_token', newTokens.AuthenticationResult.AccessToken);
                    }
                    if(newTokens?.AuthenticationResult?.RefreshToken) {
                        localStorage.setItem('refresh_token', newTokens.AuthenticationResult.RefreshToken);
                    }
                }).catch((err: Error) => {
                    console.error('Failed to refresh tokens:', err);
                });

            }
            else {
                console.error('Error during GET request:', error);
                throw error;
            }
        }
    }

    async put(endpoint: string, data: any, authorization?: string) {
        try {
            const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorization ? `Bearer ${authorization}` : '',
                },
                body: JSON.stringify(data),
            });
            const json =  await response.json();
            return json;
        }
        catch (error) {
            // check if error detail contains expired token message
            if(error instanceof Error && error.message.toLowerCase().includes('expired')) {
                // trigger token refresh
                console.log('Token expired. Please refresh the token.');
                AuthService.refreshCognitoTokens(
                    import.meta.env.VITE_COGNITO_CLIENT_ID || '',
                    localStorage.getItem('refresh_token') || ''
                ).then(newTokens => {
                    if(newTokens?.AuthenticationResult?.AccessToken) {
                        localStorage.setItem('access_token', newTokens.AuthenticationResult.AccessToken);
                    }
                    if(newTokens?.AuthenticationResult?.RefreshToken) {
                        localStorage.setItem('refresh_token', newTokens.AuthenticationResult.RefreshToken);
                    }
                }).catch((err: Error) => {
                    console.error('Failed to refresh tokens:', err);
                });

            }
            else {
                console.error('Error during PUT request:', error);
                throw error;
            }
        }
    }

    delete(endpoint: string, authorization?: string) {
        try{
            return fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authorization ? `Bearer ${authorization}` : '',
                },
            }).then(res => res.json());
        }
        catch (error) {
            // check if error detail contains expired token message
            if(error instanceof Error && error.message.includes('expired')) {
                // trigger token refresh
                console.log('Token expired. Please refresh the token.');
                AuthService.refreshCognitoTokens(
                    import.meta.env.VITE_COGNITO_CLIENT_ID || '',
                    localStorage.getItem('refresh_token') || ''
                ).then(newTokens => {
                    if(newTokens?.AuthenticationResult?.AccessToken) {
                        localStorage.setItem('access_token', newTokens.AuthenticationResult.AccessToken);
                    }
                    if(newTokens?.AuthenticationResult?.RefreshToken) {
                        localStorage.setItem('refresh_token', newTokens.AuthenticationResult.RefreshToken);
                    }
                }).catch((err: Error) => {
                    console.error('Failed to refresh tokens:', err);
                });

            }
            else {
                console.error('Error during DELETE request:', error);
                throw error;
            }
        }
    }
}

export default new ApiService();
window.global ||= window;
import { GetTokensFromRefreshTokenCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
class AuthService {
    constructor() {
        
    }
    async refreshCognitoTokens(clientId: string, refreshToken: string) {
        const client = new CognitoIdentityProviderClient({ region: import.meta.env.VITE_AWS_REGION || 'us-east-2' });
        const command = new GetTokensFromRefreshTokenCommand({
            ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || clientId,
            RefreshToken: refreshToken,
        });

        try {
            const response = await client.send(command);
            return response;
        } catch (error) {
            console.error("Error refreshing tokens:", error);
            throw error;
        }
    }

}

export default new AuthService();
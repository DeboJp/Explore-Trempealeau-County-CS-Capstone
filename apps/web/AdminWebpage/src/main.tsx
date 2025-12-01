import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import 'leaflet/dist/leaflet.css'
import 'react-tooltip/dist/react-tooltip.css'
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_7eEbiVbTX",
  client_id: "24mtca1gptj2hqtbs7dbggpmu3",
  redirect_uri: "http://localhost:5173/",
  response_type: "code",
  scope: "email openid phone",
};


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.bundle.js"></script> 
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

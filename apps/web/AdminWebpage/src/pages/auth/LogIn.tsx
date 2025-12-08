import React from 'react';
import { useAuth } from "react-oidc-context";

function Login() {
  const { login } = useAuth();

  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = "http://localhost:5173/login";
    const cognitoDomain = "https://us-east-27eebivbtx.auth.us-east-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <main className="main-content">
      You'll be redirected to the AWS Cognito sign-in page shortly...
      If you are not redirected, please click <a href="#" onClick={() => auth.signinRedirect()}>here</a>.
    </main>;
  }

  if (auth.error) {
    return <main className="main-content">Encountering error... {auth.error.message}</main>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>

        <button onClick={() => {
            auth.removeUser();
            localStorage.removeItem('access_token');
        }}>Sign out</button>
      </div>
    );
  }

  return (
    <main className="main-content">
      <div className="flex flex-col flex--align-center flex--justify-center gap-4 w-75">
        <h1>Welcome to the Trempealeau County Mobile Application Administration Portal!</h1>
        <h3 style={{fontWeight: 400}}>If you are an administrator, or have been granted access through an administrator-created account, please choose the "Sign in" button below to log in.</h3>
        <div className="w-75 flex flex--align-center flex--justify-center">
          <button className="btn btn--primary" onClick={() => auth.signinRedirect()}>Sign in</button>
        </div>
      </div>
    </main>
  );
    
}

export default Login;

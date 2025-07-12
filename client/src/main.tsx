import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './Css/index.css'
import App from './React/app/App.tsx'
import {GoogleOAuthProvider} from "@react-oauth/google";

const CLIENT_ID = "688294857588-s0t0rvufd1sd3dbk1nv9gcld1qp6tqp2.apps.googleusercontent.com";



createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
          <App />
      </GoogleOAuthProvider>
  </StrictMode>,
)

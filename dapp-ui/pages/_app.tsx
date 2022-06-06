import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import SSRProvider from 'react-bootstrap/SSRProvider';
import ProtectedRoutes from '../components/ProtectedRoutes';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <SessionProvider session={pageProps.session}>
        <ProtectedRoutes>
          <Component {...pageProps} />
        </ProtectedRoutes>
      </SessionProvider>
    </SSRProvider>
  );
}

export default MyApp;

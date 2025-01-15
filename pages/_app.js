import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import '../src/app/globals.css';

function MyApp({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else if (router.pathname !== '/auth') {
      router.push('/auth');
    }
  }, []);

  if (!isAuthenticated && router.pathname !== '/auth') {
    return null; // or a loading spinner
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

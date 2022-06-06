import type { NextPage } from 'next';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';

const Home: NextPage = () => {
  return (
    <div className="container">
      <AppHeader />
      <AppNavbar />
    </div>
  )
}

export default Home;

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './Pages/Home';
import SignIn from './Pages/SignIn';
import Header from './Components/Header';
import SignUp from './Pages/SignUp';
import ContactUs from './Pages/ContactUs';
import Tournaments from './Pages/Tournaments';
import League from './Pages/League';
import Terms from './Pages/Terms';
import Profile from './Pages/Profile';
import Rankings from './Pages/Rankings';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import PrivateRoute from './Components/PrivateRoute';
import Footer from './Components/Footer';
import BackgroundPattern from './Components/BackgroundPattern';

// Track page views on route change (SPA-aware GA4)
function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <BackgroundPattern />
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/tournaments' element={<Tournaments />} />
        <Route path='/league' element={<League />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/rankings' element={<Rankings />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import Admin from './Pages/Admin';
import AdminRoute from './Components/AdminRoute';
import PrivateRoute from './Components/PrivateRoute';
import Footer from './Components/Footer';
import IntroSplash from './Components/IntroSplash';

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
      <IntroSplash />
      <AnalyticsTracker />
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
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />

        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path='/admin' element={<Admin />} />
        </Route>

        {/* Any unknown path returns to the site instead of a blank page */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

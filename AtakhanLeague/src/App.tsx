import {BrowserRouter, Routes,Route} from 'react-router-dom';
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



export default function App() {
  return <BrowserRouter>
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

  <Route element={<PrivateRoute />} >
   <Route path='/profile' element={<Profile />} />
   </Route>
  
  </Routes>
  <Footer />
  </BrowserRouter>
}

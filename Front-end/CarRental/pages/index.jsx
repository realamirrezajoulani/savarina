import React, { useState , useContext} from 'react';
import { Footer } from "../Components/Footer/Footer"
import { NavbarDefault } from "../Components/Navbar/Navbar"
import { KpiCardSection } from "../Components/KPICard/KPICard";
import DefaultAccordion from "../Components/FAQs/FAQs";
import Header from "../Components/Header/Header";
import BlogSection from "../Components/Blog/Blog";
import { FeatureSection } from "../Components/Features/Features";
import CardSlider from "../Components/Slider/Slider";
import About from "../Components/About/About";
import Contact from "../Components/Contact/Contact";
import CarSlider from "../Components/CarSlider/CarSlider";
import Loader from '../Components/Loader/Loader';
import AuthContext from "../context/authContext";


export default function Home() {
  const authContext = useContext(AuthContext);
  const [loader, setLoader] = useState(authContext.user.role ? false : true);
  setTimeout(() => {
    setLoader(false)
  }, 2000);
  return (
    loader ? (
      <Loader />
    ) : (
      <>
        <NavbarDefault />
        <Header />
        <About />
        <CarSlider />
        <FeatureSection />
        <CarSlider />
        <BlogSection />
        <Contact />
        <DefaultAccordion />
        <Footer />
      </>
    )
  );
}

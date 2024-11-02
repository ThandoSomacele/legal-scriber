// eslint-disable-next-line no-unused-vars
import React from 'react';
import FeaturesSection from '../FeaturesSection';
import PricingSection from '../PricingSection';
import AboutUsSection from '../AboutUsSection';
import ContactUsSection from '../ContactUsSection';
import HeroSection from '../HeroSection';
import SubscriptionPlans from '../SubscriptionPlans';

const Home = () => {
  return (
    <div className='bg-white'>
      <main>
        <HeroSection />
        <FeaturesSection />
        <SubscriptionPlans />
        {/* <PricingSection /> */}
        <AboutUsSection />
        <ContactUsSection />
      </main>
    </div>
  );
};

export default Home;

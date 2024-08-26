import React, { useEffect } from 'react';
import { Element, Events, animateScroll as scroll, scroller } from 'react-scroll';

// Import all slide components
import TitleSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-1';
import ProblemSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-2';
import SolutionSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-3';
import ProductFeaturesSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-4';
import MarketOpportunitySlide from './../pitch-deck/legal-scriber-pitch-deck-slide-5';
import CompetitiveAdvantageSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-6';
import BusinessModelSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-7';
import TractionMilestonesSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-8';
import TeamSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-9';
import FinancialsSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-10';
import RoadmapSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-11';
import CallToActionSlide from './../pitch-deck/legal-scriber-pitch-deck-slide-12';

const PitchDeck = () => {
  return (
    <div className='pitch-deck'>
      <TitleSlide />

      <ProblemSlide />

      <SolutionSlide />

      <ProductFeaturesSlide />

      <MarketOpportunitySlide />

      <CompetitiveAdvantageSlide />

      <BusinessModelSlide />

      <TractionMilestonesSlide />

      <TeamSlide />

      <FinancialsSlide />

      <RoadmapSlide />

      <CallToActionSlide />
    </div>
  );
};

export default PitchDeck;

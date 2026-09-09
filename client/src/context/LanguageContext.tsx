import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Taglines
    appName: 'KisanDirect',
    appTagline: 'Harvester to Buyer',
    heroTitle: 'From Harvest to Buyer, Without Unnecessary Intermediaries.',
    heroSubtitle: 'Connect farmers with real buyer demand, combine small farm quantities into bulk orders, negotiate fair prices, and move fresh produce before it becomes waste.',
    sellProduce: 'Sell Your Produce',
    findProduce: 'Find Fresh Produce',
    postRequirement: 'Post a Requirement',

    // Farmer Navigation & Actions
    dashboard: 'Dashboard',
    myProduce: 'My Produce',
    addProduce: 'Add Produce',
    buyerOffers: 'New Offers',
    myOrders: 'My Orders',
    collectiveSelling: 'Collective Selling',
    myEarnings: 'My Earnings',
    voiceListing: 'Voice Listing',
    help: 'Help',
    logout: 'Logout',
    notifications: 'Notifications',

    // Statuses
    fresh: 'Fresh',
    aging: 'Aging',
    urgentSale: 'Urgent Sale',
    expired: 'Expired',
    activeBatches: 'Active Batches',
    pendingOffers: 'Pending Offers',
    orders: 'Orders',
    availableQuantity: 'Available Quantity',
    todaysEarnings: "Today's Earnings",
    verifiedFarmer: 'Verified Farmer',
    fairPriceRef: 'Fair Price Reference',

    // Buyer Navigation & Actions
    marketplace: 'Marketplace',
    postDemand: 'Post Demand',
    myDemands: 'My Demands',
    smartMatches: 'Smart Matches',
    tracking: 'Delivery Tracking',
    payments: 'Payments',

    // General
    login: 'Login',
    register: 'Register',
    demoSwitcher: 'Demo Persona Switcher',
  },
  ta: {
    // Brand & Taglines
    appName: 'கிசான் டைரக்ட்',
    appTagline: 'விவசாயியிடம் இருந்து நேரடியாக வாங்குபவருக்கு',
    heroTitle: 'அறுவடை முதல் வாங்குபவர் வரை, இடைத்தரகர்கள் இன்றி நேரடி வர்த்தகம்.',
    heroSubtitle: 'விவசாயிகளை நேரடி வாங்குபவர்களுடன் இணைத்து, சிறு விவசாயிகளின் விளைபொருட்களை ஒன்று சேர்த்து மொத்த விற்பனை செய்து, நியாயமான விலையை உறுதி செய்கிறது.',
    sellProduce: 'விளைபொருளை விற்க',
    findProduce: 'புதிய விளைபொருட்கள்',
    postRequirement: 'தேவையை பதிவிட',

    // Farmer Navigation & Actions
    dashboard: 'முகப்பு',
    myProduce: 'என் பொருட்கள்',
    addProduce: 'புதிய பொருளை சேர்க்க',
    buyerOffers: 'புதிய Offers',
    myOrders: 'என் ஆர்டர்கள்',
    collectiveSelling: 'கூட்டு விற்பனை',
    myEarnings: 'எனக்கு கிடைத்த விலை',
    voiceListing: 'குரல் பதிவு (Voice)',
    help: 'உதவி',
    logout: 'வெளியேறு',
    notifications: 'அறிவிப்புகள்',

    // Statuses
    fresh: 'புதிய அறுவடை (Fresh)',
    aging: 'முதிர்வு (Aging)',
    urgentSale: 'உடனடி விற்பனை (Urgent)',
    expired: 'காலாவதியானது (Expired)',
    activeBatches: 'செயலில் உள்ள பொருட்கள்',
    pendingOffers: 'நிலுவையில் உள்ள சலுகைகள்',
    orders: 'ஆர்டர்கள்',
    availableQuantity: 'மொத்த கையிருப்பு',
    todaysEarnings: 'இன்றைய வருமானம்',
    verifiedFarmer: 'சரிபார்க்கப்பட்ட விவசாயி',
    fairPriceRef: 'சந்தை நியாய விலை வழிகாட்டி',

    // Buyer Navigation & Actions
    marketplace: 'சந்தை (Market)',
    postDemand: 'தேவை பதிவு செய்',
    myDemands: 'என் தேவைகள்',
    smartMatches: 'பொருத்தமான விவசாயிகள்',
    tracking: 'விநியோக கண்காணிப்பு',
    payments: 'பணப்பரிமாற்றம்',

    // General
    login: 'உள்நுழை',
    register: 'பதிவு செய்',
    demoSwitcher: 'டெமோ கணக்கு மாற்றி',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kisandirect_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kisandirect_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

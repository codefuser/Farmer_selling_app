import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & App Shell
    appName: 'KisanDirect',
    appTagline: 'Harvester to Buyer Direct Marketplace',
    heroTitle: 'From Soil To Store · No Middlemen, Fair Prices Guaranteed',
    heroSubtitle: 'Direct agricultural marketplace connecting smallholder farmers with commercial kitchens, supermarkets, and wholesale buyers.',
    locationSalem: 'Salem, Tamil Nadu',
    dailyMandiRates: 'Daily Mandi Rates',
    allTowns: 'All Markets',
    demoControls: 'Demo Controls',

    // Onboarding
    welcomeToApp: 'Welcome to KisanDirect',
    onboardingTagline: 'Empowering Farmers. Delivering Freshness.',
    slide1Title: 'Fresh from Farmers',
    slide1Desc: 'Harvested fresh this morning and directly dispatched within hours.',
    slide2Title: 'Guaranteed Fair Prices',
    slide2Desc: 'Transparent APMC Mandi rates guarantee +15% more earnings for farmers.',
    slide3Title: 'Direct Buying & Escrow',
    slide3Desc: 'No 5-tier middleman chain. Payments held safely in escrow until verified delivery.',
    slide4Title: 'Collective Selling Innovation',
    slide4Desc: 'Multiple small farmers unite to satisfy commercial 500kg+ bulk orders.',
    getStarted: 'Get Started',
    skip: 'Skip',
    howWillYouUse: 'How are you using KisanDirect?',
    iAmFarmer: 'I am a Farmer',
    farmerRoleDesc: 'List harvests, get fair prices, direct bank payouts',
    iAmBuyer: 'I am a Buyer',
    buyerRoleDesc: 'Hotels, restaurants, supermarkets buying in bulk',
    iAmCoordinator: 'Village Coordinator',
    coordinatorRoleDesc: 'Assist local farmers with digital registrations',

    // Navigation & Tabs
    home: 'Home',
    dashboard: 'Dashboard',
    myProduce: 'My Produce',
    addProduce: 'Add Produce',
    buyerOffers: 'Buyer Offers',
    myOrders: 'My Orders',
    collectiveSelling: 'Collective Selling',
    myEarnings: 'My Earnings',
    voiceListing: 'Voice Listing',
    marketplace: 'Marketplace',
    postDemand: 'Post Demand',
    smartMatches: 'Smart Matches',
    cart: 'Cart',
    profile: 'Profile',
    help: 'Help',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    notifications: 'Notifications',

    // Statuses
    fresh: 'Fresh',
    aging: 'Aging',
    urgentSale: 'Urgent Sale',
    expired: 'Expired',
    soldOut: 'Sold Out',
    activeBatches: 'Active Batches',
    pendingOffers: 'Pending Offers',
    orders: 'Orders',
    availableQuantity: 'Available Quantity',
    todaysEarnings: "Today's Earnings",
    verifiedFarmer: 'Verified Farmer',
    verifiedBuyer: 'Verified Buyer',
    fairPriceRef: 'Fair Price Reference',
    fairPriceZone: 'Fair Price Zone',

    // Farmer Creator Flow
    whatSelling: 'What crop are you selling?',
    chooseCrop: 'Choose Crop',
    cropQuantity: 'Harvest Quantity (kg)',
    expectedPriceKg: 'Expected Price per kg (₹)',
    harvestTime: 'Harvest Date & Time',
    qualityGrade: 'Quality Grade',
    addPhotos: 'Add Produce Photos',
    takePhoto: 'Take Photo',
    chooseGallery: 'Choose from Gallery',
    previewListing: 'Preview Listing',
    publishBatch: 'Publish Batch',
    batchPublishedSuccess: 'Your produce batch is live on the marketplace!',
    attentionNeeded: 'Produce Needing Attention',
    quickActions: 'Quick Actions',

    // Buyer Discovery & Shopping
    searchPlaceholder: 'What produce do you need today?',
    allCategories: 'All',
    categoryVegetables: 'Vegetables',
    categoryFruits: 'Fruits',
    categoryLeafy: 'Greens',
    categoryBulk: 'Bulk Orders',
    freshToday: 'Fresh Today',
    nearbyFarmers: 'Nearby Farmers',
    bestFairPrice: 'Fair Price Deals',
    urgentDeals: 'Urgent Harvest Sales',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    checkout: 'Checkout',
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    confirmOrder: 'Confirm Order',
    deliveryAddress: 'Delivery Address',
    paymentMethod: 'Payment Method',
    mockUpi: 'UPI / Net Banking (Escrow)',
    orderPlacedSuccess: 'Order placed successfully! Track live dispatch below.',
    emptyCartTitle: 'Your cart is empty',
    emptyCartDesc: 'Explore fresh harvests from verified local farmers.',
    exploreMarketplace: 'Explore Marketplace',

    // Order Lifecycle Timeline
    stageOrdered: 'Order Placed',
    stageAccepted: 'Accepted by Farmer',
    stagePickupScheduled: 'Pickup Scheduled',
    stageCollected: 'Collected from Farm',
    stageQualityChecked: 'Quality Verified',
    stagePacked: 'Packed & Barcoded',
    stageDispatched: 'Dispatched',
    stageDelivered: 'Delivered',
    stagePaymentReleased: 'Payment Released',
    stageCompleted: 'Completed',
    stageCancelled: 'Cancelled',
    advanceDemoStage: 'Advance to Next Stage (Demo)',
    releaseEscrowPayout: 'Confirm Delivery & Release Payout',
    leaveReview: 'Submit Farmer Review',

    // Auth & Form Errors
    mobileNumber: 'Mobile Number',
    password: 'Password',
    contactName: 'Contact Name',
    village: 'Village / Town',
    district: 'District',
    businessName: 'Business Name',
    businessType: 'Business Type',
    tryDemo: 'Try Demo Persona',
    continueAsRole: 'Continue as',
    alreadyHaveAccount: 'Already have an account? Sign in',
    dontHaveAccount: "Don't have an account? Register",
  },

  ta: {
    // Brand & App Shell
    appName: 'கிசான் டைரக்ட்',
    appTagline: 'விவசாயியிடம் இருந்து நேரடியாக வாங்குபவருக்கு',
    heroTitle: 'மண்ணில் இருந்து சந்தைக்கு · இடைத்தரகர்கள் இல்லை, நியாய விலை உறுதி',
    heroSubtitle: 'சிறு விவசாயிகளை வணிக விடுதிகள், உணவகங்கள் மற்றும் பல்பொருள் அங்காடிகளுடன் நேரடியாக இணைக்கும் வேளாண் தளம்.',
    locationSalem: 'சேலம், தமிழ்நாடு',
    dailyMandiRates: 'தினசரி மண்டி விலை',
    allTowns: 'அனைத்து சந்தைகள்',
    demoControls: 'டெமோ கட்டுப்பாடுகள்',

    // Onboarding
    welcomeToApp: 'கிசான் டைரக்ட்டிற்கு நல்வரவு',
    onboardingTagline: 'விவசாயிகளை உயர்த்துவோம். நுகர்வோருக்கு புதியதை வழங்குவோம்.',
    slide1Title: 'விவசாயிகளிடமிருந்து புதியவை',
    slide1Desc: 'இன்று அதிகாலை தோட்டத்தில் அறுவடை செய்யப்பட்டு சில மணி நேரங்களில் நேரடியாக உங்கள் கைக்கு வருகிறது.',
    slide2Title: 'உறுதியான நியாய விலை',
    slide2Desc: 'அரசு மண்டி விலை வழிகாட்டியுடன் விவசாயிகளுக்கு 15% கூடுதல் வருமானம் நேரடியாகக் கிடைக்கிறது.',
    slide3Title: 'நேரடி கொள்முதல் & எஸ்க்ரோ',
    slide3Desc: 'இடைத்தரகர்கள் இல்லை. தரமான பொருள் கிடைத்த பிறகே விவசாயிக்கு பணம் விடுவிக்கப்படும் பாதுகாப்பான எஸ்க்ரோ.',
    slide4Title: 'கூட்டு விற்பனை புதுமை',
    slide4Desc: 'பல சிறு விவசாயிகள் இணைந்து 500 கிலோ போன்ற பெரிய வணிக தேவைகளை எளிதாக பூர்த்தி செய்யலாம்.',
    getStarted: 'தொடங்குங்கள்',
    skip: 'தவிர்',
    howWillYouUse: 'கிசான் டைரக்ட்டை எவ்வாறு பயன்படுத்த விரும்புகிறீர்கள்?',
    iAmFarmer: 'நான் ஒரு விவசாயி',
    farmerRoleDesc: 'விளைபொருளை பதிவிட, நியாய விலை பெற, வங்கிக் கணக்கில் நேரடி பணம்',
    iAmBuyer: 'நான் ஒரு வாங்குபவர்',
    buyerRoleDesc: 'மொத்தமாக வாங்க விரும்பும் விடுதிகள், உணவகங்கள், கடைகள்',
    iAmCoordinator: 'கிராம ஒருங்கிணைப்பாளர்',
    coordinatorRoleDesc: 'கிராம விவசாயிகளுக்கு உதவவும் பதிவு செய்யவும்',

    // Navigation & Tabs
    home: 'முகப்பு',
    dashboard: 'கட்டுப்பாட்டு அறை',
    myProduce: 'என் விளைபொருட்கள்',
    addProduce: 'விளைபொருள் சேர்',
    buyerOffers: 'வாங்குபவர் வாய்ப்புகள்',
    myOrders: 'என் ஆர்டர்கள்',
    collectiveSelling: 'கூட்டு விற்பனை',
    myEarnings: 'என் வருமானம்',
    voiceListing: 'குரல் பதிவு',
    marketplace: 'சந்தை',
    postDemand: 'தேவை பதிவு செய்',
    smartMatches: 'பொருத்தமான வாய்ப்புகள்',
    cart: 'கூடை',
    profile: 'சுயவிவரம்',
    help: 'உதவி',
    logout: 'வெளியேறு',
    login: 'உள்நுழை',
    register: 'பதிவு செய்',
    notifications: 'அறிவிப்புகள்',

    // Statuses
    fresh: 'புதிதாக அறுவடை',
    aging: 'விரைவில் விற்கவும்',
    urgentSale: 'உடனடி விற்பனை',
    expired: 'காலாவதியானது',
    soldOut: 'விற்றுத் தீர்ந்தது',
    activeBatches: 'செயலில் உள்ளவை',
    pendingOffers: 'நிலுவை சலுகைகள்',
    orders: 'ஆர்டர்கள்',
    availableQuantity: 'கையிருப்பு அளவு',
    todaysEarnings: 'இன்றைய வருமானம்',
    verifiedFarmer: 'சரிபார்க்கப்பட்ட விவசாயி',
    verifiedBuyer: 'சரிபார்க்கப்பட்ட வாங்குபவர்',
    fairPriceRef: 'மண்டி நியாய விலை வழிகாட்டி',
    fairPriceZone: 'நியாய விலை மண்டலம்',

    // Farmer Creator Flow
    whatSelling: 'என்ன விளைபொருளை விற்கிறீர்கள்?',
    chooseCrop: 'பயிரைத் தேர்ந்தெடுக்கவும்',
    cropQuantity: 'அறுவடை அளவு (கிலோ)',
    expectedPriceKg: 'எதிர்பார்க்கும் விலை / கிலோ (₹)',
    harvestTime: 'அறுவடை நாள் & நேரம்',
    qualityGrade: 'தர நிலை',
    addPhotos: 'விளைபொருள் புகைப்படம் சேர்க்க',
    takePhoto: 'புகைப்படம் எடு',
    chooseGallery: 'படத்தைத் தேர்ந்தெடு',
    previewListing: 'பட்டியல் முன்னோட்டம்',
    publishBatch: 'சந்தையில் வெளியிடு',
    batchPublishedSuccess: 'உங்கள் விளைபொருள் சந்தையில் சேர்க்கப்பட்டது!',
    attentionNeeded: 'இப்போது கவனிக்க வேண்டியவை',
    quickActions: 'விரைவான செயல்கள்',

    // Buyer Discovery & Shopping
    searchPlaceholder: 'எந்த காய்கறி வாங்க வேண்டும்?',
    allCategories: 'அனைத்தும்',
    categoryVegetables: 'காய்கறிகள்',
    categoryFruits: 'பழங்கள்',
    categoryLeafy: 'கீரைகள்',
    categoryBulk: 'மொத்த ஆர்டர்கள்',
    freshToday: 'இன்று புதிதாக வந்தவை',
    nearbyFarmers: 'அருகிலுள்ள விவசாயிகள்',
    bestFairPrice: 'சிறந்த நியாய விலை',
    urgentDeals: 'உடனடி தள்ளுபடி விற்பனை',
    addToCart: 'கூடையில் சேர்',
    buyNow: 'இப்போது வாங்கு',
    checkout: 'ஆர்டர் செய்',
    quantity: 'அளவு',
    subtotal: 'பொருட்கள் விலை',
    deliveryFee: 'விநியோக கட்டணம்',
    total: 'மொத்தம்',
    proceedToCheckout: 'செக் அவுட் செல்க',
    confirmOrder: 'ஆர்டரை உறுதி செய்',
    deliveryAddress: 'டெலிவரி முகவரி',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    mockUpi: 'UPI / இணைய வங்கி (எஸ்க்ரோ)',
    orderPlacedSuccess: 'ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது! விநியோக விவரங்களை கீழே காண்க.',
    emptyCartTitle: 'உங்கள் கூடை காலியாக உள்ளது',
    emptyCartDesc: 'உள்ளூர் விவசாயிகளிடமிருந்து புதிய விளைபொருட்களை வாங்குங்கள்.',
    exploreMarketplace: 'சந்தையை பார்க்க',

    // Order Lifecycle Timeline
    stageOrdered: 'ஆர்டர் செய்யப்பட்டது',
    stageAccepted: 'விவசாயியால் ஏற்கப்பட்டது',
    stagePickupScheduled: 'வாகனம் திட்டமிடப்பட்டது',
    stageCollected: 'பண்ணையில் சேகரிக்கப்பட்டது',
    stageQualityChecked: 'தரச் சோதனை நிறைவு',
    stagePacked: 'பொதியிடப்பட்டது',
    stageDispatched: 'வண்டியில் அனுப்பப்பட்டது',
    stageDelivered: 'வழங்கப்பட்டது',
    stagePaymentReleased: 'பணம் விவசாயிக்கு விடுவிக்கப்பட்டது',
    stageCompleted: 'முழுமை பெற்றது',
    stageCancelled: 'ரத்து செய்யப்பட்டது',
    advanceDemoStage: 'அடுத்த நிலைக்கு நகர்த்து (டெமோ)',
    releaseEscrowPayout: 'பொருளை பெற்றுக்கொண்டு பணத்தை விடுவிக்கவும்',
    leaveReview: 'மதிப்பீடு வழங்கவும்',

    // Auth & Form Errors
    mobileNumber: 'கைபேசி எண்',
    password: 'கடவுச்சொல்',
    contactName: 'பெயர்',
    village: 'கிராமம் / ஊர்',
    district: 'மாவட்டம்',
    businessName: 'வணிகப் பெயர்',
    businessType: 'வணிக வகை',
    tryDemo: 'டெமோ கணக்கை தேர்வு செய்க',
    continueAsRole: 'தொடர்க',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்',
    dontHaveAccount: 'புதியவரா? பதிவு செய்யவும்',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kisandirect_lang') as Language) || 'ta'; // Default to Tamil for SIH demo!
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

export default LanguageContext;

// .knowledge/scripts/build-ui-graph.js
// Assembles the Complete UI Knowledge Graph for KisanDirect
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const knowledgeDir = path.resolve(rootDir, '.knowledge');

const uiNodes = [];
const uiRelationships = [];
const nodeSet = new Set();

function addNode(node) {
  if (nodeSet.has(node.id)) {
    console.warn(`Duplicate node skipped: ${node.id}`);
    return;
  }
  nodeSet.add(node.id);
  uiNodes.push(node);
}

function addRel(from, type, to, metadata = {}) {
  uiRelationships.push({ from, type, to, ...metadata });
}

// -------------------------------------------------------------
// 1. UI VIEWS (State-Based Routes in App.tsx)
// -------------------------------------------------------------
const uiViews = [
  { id: 'view:landing', name: 'Landing Page View', slug: 'landing', role: 'PUBLIC', component: 'component:LandingPage', description: 'Public entry point featuring hero, key innovations, APMC rates snapshot, and role cards' },
  { id: 'view:how-it-works', name: 'How It Works View', slug: 'how-it-works', role: 'PUBLIC', component: 'component:HowItWorksPage', description: 'Illustrated 4-step direct agricultural supply chain explanation' },
  { id: 'view:market-rates', name: 'Live Market Rates View', slug: 'market-rates', role: 'PUBLIC', component: 'component:MarketRatesPage', description: 'Real-time 13-mandi APMC daily rates explorer with category filters and grid/table views' },
  { id: 'view:for-farmers', name: 'For Farmers View', slug: 'for-farmers', role: 'PUBLIC', component: 'component:ForFarmersPage', description: 'Value proposition and fair price guarantee for smallholder producers' },
  { id: 'view:for-buyers', name: 'For Buyers View', slug: 'for-buyers', role: 'PUBLIC', component: 'component:ForBuyersPage', description: 'Value proposition, bulk collective supply, and freshness guarantee for B2B buyers' },
  { id: 'view:impact', name: 'Impact Telemetry View', slug: 'impact', role: 'PUBLIC', component: 'component:ImpactPage', description: 'Social and economic impact metrics, wastage reduction, and middlemen savings' },
  { id: 'view:login', name: 'Login View', slug: 'login', role: 'PUBLIC', component: 'component:LoginPage', description: 'User login form with password/mobile and quick persona switcher pills' },
  { id: 'view:register', name: 'Registration View', slug: 'register', role: 'PUBLIC', component: 'component:RegisterPage', description: 'Role-based registration wizard for Farmers, Buyers, and Coordinators' },
  { id: 'view:profile', name: 'User Profile View', slug: 'profile', role: 'AUTHENTICATED', component: 'component:ProfilePage', description: 'User profile management, verified badges, and contact credentials' },

  // Farmer Views
  { id: 'view:farmer-dashboard', name: 'Farmer Dashboard View', slug: 'farmer-dashboard', role: 'FARMER', component: 'component:FarmerDashboard', description: 'Farmer hub overview: quick actions, pending offers, stock breakdown, and earnings telemetry' },
  { id: 'view:farmer-produce', name: 'My Produce View', slug: 'farmer-produce', role: 'FARMER', component: 'component:MyProduce', description: 'Produce batch inventory showing cards with freshness countdowns and status indicators' },
  { id: 'view:farmer-add-produce', name: 'Add Produce View', slug: 'farmer-add-produce', role: 'FARMER', component: 'component:AddProduce', description: '5-step listing wizard with photo capture, grade selection, price gauge, and freshness preview' },
  { id: 'view:farmer-offers', name: 'Farmer Offers Inbox View', slug: 'farmer-offers', role: 'FARMER', component: 'component:FarmerOffers', description: 'Incoming buyer negotiation offers with Accept, Reject, and Counter-Offer actions' },
  { id: 'view:farmer-collective', name: 'Farmer Collective Pools View', slug: 'farmer-collective', role: 'FARMER', component: 'component:FarmerCollective', description: 'History of pooled collective orders farmer participates in' },
  { id: 'view:farmer-orders', name: 'Farmer Orders View', slug: 'farmer-orders', role: 'FARMER', component: 'component:FarmerOrders', description: 'Farmer order fulfillment tracking and collection depot drop-off status' },
  { id: 'view:farmer-earnings', name: 'Farmer Earnings View', slug: 'farmer-earnings', role: 'FARMER', component: 'component:FarmerEarnings', description: 'Payout analytics, monthly volume/earnings chart, and middlemen savings comparison' },

  // Buyer Views
  { id: 'view:buyer-dashboard', name: 'Buyer Dashboard View', slug: 'buyer-dashboard', role: 'BUYER', component: 'component:BuyerDashboard', description: 'Buyer overview showing active demands, orders in transit, and total spend' },
  { id: 'view:buyer-marketplace', name: 'Marketplace View', slug: 'buyer-marketplace', role: 'BUYER', component: 'component:Marketplace', description: 'Live produce catalog with filters (crop, grade, freshness, price), sorting, and cart/buy now actions' },
  { id: 'view:buyer-post-demand', name: 'Post Demand View', slug: 'buyer-post-demand', role: 'BUYER', component: 'component:PostDemand', description: 'Form for commercial buyers to post bulk produce requirements (500kg-2000kg)' },
  { id: 'view:buyer-smart-matches', name: 'Smart Matches View', slug: 'buyer-smart-matches', role: 'BUYER', component: 'component:SmartMatches', description: 'Multi-factor suitability matches and collective supply pooling view' },
  { id: 'view:buyer-orders', name: 'Buyer Orders View', slug: 'buyer-orders', role: 'BUYER', component: 'component:BuyerOrders', description: '10-stage order lifecycle tracking with interactive SVG route map and review feedback' },

  // Coordinator, Logistics & Admin Views
  { id: 'view:coordinator-dashboard', name: 'Coordinator Dashboard View', slug: 'coordinator-dashboard', role: 'COORDINATOR', component: 'component:CoordinatorDashboard', description: 'Village Digital Hub desk for assisted farmer registration and voice produce listing' },
  { id: 'view:logistics-dashboard', name: 'Logistics Dashboard View', slug: 'logistics-dashboard', role: 'LOGISTICS', component: 'component:LogisticsDashboard', description: 'Fleet management desk with pickup scheduling, GPS updates, and hub quality inspections' },
  { id: 'view:admin-dashboard', name: 'Admin Dashboard View', slug: 'admin-dashboard', role: 'ADMIN', component: 'component:AdminDashboard', description: 'Governance control center with financial telemetry, dispute arbitration, and user moderation' }
];

uiViews.forEach(v => {
  addNode({ id: v.id, type: 'ui_view', name: v.name, slug: v.slug, role: v.role, description: v.description });
  addRel('component:App', 'routes_to', v.id);
  addRel(v.id, 'renders_component', v.component);
});

// -------------------------------------------------------------
// 2. MODALS, DRAWERS & OVERLAYS
// -------------------------------------------------------------
const uiOverlays = [
  { id: 'overlay:CartDrawer', name: 'Cart Slide-Over Drawer', file: 'client/src/features/buyer/CartDrawer.tsx', description: 'Slide-over cart drawer displaying selected items, quantities, subtotal, delivery fee, and checkout CTA' },
  { id: 'overlay:CheckoutModal', name: 'Direct Checkout Modal', file: 'client/src/features/buyer/CheckoutModal.tsx', description: 'Dialog confirming delivery address, phone, and escrow payment authorization' },
  { id: 'overlay:ProductDetailPage', name: 'Product Detail Modal', file: 'client/src/features/buyer/ProductDetailPage.tsx', description: 'Full produce batch modal with freshness countdown, farmer rating, and quantity selector' },
  { id: 'overlay:VoiceListingModal', name: 'Bilingual Voice Listing Modal', file: 'client/src/components/common/VoiceListingModal.tsx', description: 'Simulated speech-to-text dialog in Tamil and English extracting crop, quantity, and price' },
  { id: 'overlay:OnboardingView', name: 'First-Time Onboarding Carousel', file: 'client/src/components/common/OnboardingView.tsx', description: '4-step onboarding carousel with persona role selection' },
  { id: 'overlay:SplashScreen', name: 'Startup Splash Screen', file: 'client/src/components/common/SplashScreen.tsx', description: 'Startup animated splash screen with problem statement branding' }
];

uiOverlays.forEach(o => {
  addNode({ id: o.id, type: 'ui_overlay', name: o.name, file: o.file, description: o.description });
  addRel('component:App', 'hosts_overlay', o.id);
});

// -------------------------------------------------------------
// 3. COMPLETE UI COMPONENT MANIFEST (Props, State, Events, Hooks)
// -------------------------------------------------------------
const uiComponentsDetailed = [
  // App Shell & Shared Components
  {
    id: 'component:App',
    name: 'App',
    file: 'client/src/App.tsx',
    props: [],
    state: ['currentView', 'viewParams', 'voiceModalOpen', 'showSplash', 'hasOnboarded', 'isGlobalCheckoutOpen'],
    events: ['navigate(view, params)', 'handleTriggerScenario1', 'handleTriggerScenario2', 'handleTriggerScenario3', 'handleOnboardingComplete'],
    hooks: ['useAuth', 'useLanguage', 'useCart'],
    apisCalled: ['api.simulateUrgency'],
    children: [
      'component:SplashScreen',
      'component:OnboardingView',
      'component:DemoScenarioBar',
      'component:Navbar',
      'component:MobileBottomNav',
      'component:CartDrawer',
      'component:CheckoutModal',
      'component:VoiceListingModal'
    ]
  },
  {
    id: 'component:Navbar',
    name: 'Navbar',
    file: 'client/src/components/common/Navbar.tsx',
    props: ['currentView: string', 'onNavigate: (view: string) => void', 'onOpenVoiceModal: () => void'],
    state: ['showNotifDropdown: boolean', 'mobileMenuOpen: boolean', 'ticker: Array'],
    events: ['onNavigate', 'onOpenVoiceModal', 'logout', 'setLanguage', 'openCart'],
    hooks: ['useAuth', 'useLanguage', 'useCart'],
    apisCalled: ['api.getMarketTicker'],
    children: []
  },
  {
    id: 'component:DemoScenarioBar',
    name: 'DemoScenarioBar',
    file: 'client/src/components/common/DemoScenarioBar.tsx',
    props: ['onTriggerScenario1: () => void', 'onTriggerScenario2: () => void', 'onTriggerScenario3: () => void'],
    state: ['isOpen: boolean', 'statusMsg: string | null'],
    events: ['handleSwitch(role, name)', 'onTriggerScenario1', 'onTriggerScenario2', 'onTriggerScenario3'],
    hooks: ['useAuth', 'useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:FreshnessBadge',
    name: 'FreshnessBadge',
    file: 'client/src/components/common/FreshnessBadge.tsx',
    props: ['status: FreshnessStatus', 'remainingText?: string', 'hoursRemaining?: number', 'minutesRemaining?: number', 'showIcon?: boolean', 'size?: "sm" | "md" | "lg"'],
    state: [],
    events: [],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:FairPriceGauge',
    name: 'FairPriceGauge',
    file: 'client/src/components/common/FairPriceGauge.tsx',
    props: ['modalPrice: number', 'currentPrice: number', 'minPrice?: number', 'maxPrice?: number', 'compact?: boolean'],
    state: [],
    events: [],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:DeliveryMap',
    name: 'DeliveryMap',
    file: 'client/src/components/common/DeliveryMap.tsx',
    props: ['orderStatus: OrderStatus', 'deliveryAddress?: string', 'compact?: boolean'],
    state: [],
    events: [],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:VoiceListingModal',
    name: 'VoiceListingModal',
    file: 'client/src/components/common/VoiceListingModal.tsx',
    props: ['isOpen: boolean', 'onClose: () => void', 'onBatchCreated?: () => void'],
    state: ['isListening: boolean', 'spokenText: string', 'parsedProduce: any', 'detectedLanguage: string', 'isSubmitting: boolean', 'error: string | null', 'statusMessage: string | null'],
    events: ['startListening', 'stopListening', 'handleConfirmAndPublish', 'handleSimulateSpeech'],
    hooks: ['useLanguage', 'useAuth'],
    apisCalled: ['api.coordinatorCreateBatch', 'api.createFarmerBatch'],
    children: []
  },
  {
    id: 'component:MobileBottomNav',
    name: 'MobileBottomNav',
    file: 'client/src/components/common/MobileBottomNav.tsx',
    props: ['currentView: string', 'onNavigate: (view: string) => void'],
    state: [],
    events: ['onNavigate', 'openCart'],
    hooks: ['useAuth', 'useLanguage', 'useCart'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:OnboardingView',
    name: 'OnboardingView',
    file: 'client/src/components/common/OnboardingView.tsx',
    props: ['onComplete: (selectedRole?: string) => void'],
    state: ['currentSlide: number', 'selectedRole: string | null'],
    events: ['handleNext', 'handleSkip', 'handleRoleSelect'],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:SplashScreen',
    name: 'SplashScreen',
    file: 'client/src/components/common/SplashScreen.tsx',
    props: ['onFinish: () => void'],
    state: [],
    events: ['onFinish'],
    hooks: [],
    apisCalled: [],
    children: []
  },

  // Farmer Feature Components
  {
    id: 'component:FarmerDashboard',
    name: 'FarmerDashboard',
    file: 'client/src/features/farmer/FarmerDashboard.tsx',
    props: ['onNavigate: (view: string) => void', 'onOpenVoiceModal: () => void'],
    state: ['stats: any', 'recentBatches: any[]', 'loading: boolean'],
    events: ['onNavigate', 'onOpenVoiceModal', 'loadDashboard'],
    hooks: ['useLanguage', 'useAuth'],
    apisCalled: ['api.getFarmerDashboard'],
    children: ['component:FreshnessBadge']
  },
  {
    id: 'component:AddProduce',
    name: 'AddProduce',
    file: 'client/src/features/farmer/AddProduce.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: ['step: number', 'products: Product[]', 'selectedProduct: Product | null', 'quantity: string', 'qualityGrade: "A" | "B" | "C"', 'expectedPrice: string', 'harvestTime: string', 'sellByHours: number', 'uploadedImageUrl: string | null', 'imagePreview: string | null', 'isUploadingImage: boolean', 'isSubmitting: boolean', 'error: string | null', 'createdBatch: any'],
    events: ['handleProductSelect', 'handleFileChange', 'handlePublish', 'onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerProducts', 'api.uploadImage', 'api.createFarmerBatch'],
    children: ['component:FairPriceGauge', 'component:FreshnessBadge']
  },
  {
    id: 'component:MyProduce',
    name: 'MyProduce',
    file: 'client/src/features/farmer/MyProduce.tsx',
    props: ['onNavigate: (view: string) => void', 'onOpenVoiceModal: () => void'],
    state: ['batches: ProduceBatch[]', 'loading: boolean'],
    events: ['loadBatches', 'onNavigate', 'onOpenVoiceModal'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerBatches'],
    children: ['component:FreshnessBadge']
  },
  {
    id: 'component:FarmerOffers',
    name: 'FarmerOffers',
    file: 'client/src/features/farmer/FarmerOffers.tsx',
    props: [],
    state: ['offers: Offer[]', 'loading: boolean', 'counterModalOffer: Offer | null', 'counterPrice: string', 'counterNotes: string', 'isSubmitting: boolean', 'statusMsg: string | null'],
    events: ['handleAccept(offerId)', 'handleReject(offerId)', 'handleCounterSubmit'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerOffers', 'api.acceptFarmerOffer', 'api.rejectFarmerOffer', 'api.counterFarmerOffer'],
    children: []
  },
  {
    id: 'component:FarmerCollective',
    name: 'FarmerCollective',
    file: 'client/src/features/farmer/FarmerCollective.tsx',
    props: [],
    state: ['pools: any[]', 'loading: boolean'],
    events: ['loadPools'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerCollectivePools'],
    children: []
  },
  {
    id: 'component:FarmerOrders',
    name: 'FarmerOrders',
    file: 'client/src/features/farmer/FarmerOrders.tsx',
    props: [],
    state: ['orders: any[]', 'loading: boolean'],
    events: ['loadOrders'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerOrders'],
    children: []
  },
  {
    id: 'component:FarmerEarnings',
    name: 'FarmerEarnings',
    file: 'client/src/features/farmer/FarmerEarnings.tsx',
    props: [],
    state: ['data: any', 'loading: boolean'],
    events: ['loadEarnings'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerEarnings'],
    children: []
  },

  // Buyer Feature Components
  {
    id: 'component:BuyerDashboard',
    name: 'BuyerDashboard',
    file: 'client/src/features/buyer/BuyerDashboard.tsx',
    props: ['onNavigate: (view: string, params?: any) => void'],
    state: ['data: any', 'loading: boolean'],
    events: ['loadDashboard', 'onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getBuyerDashboard'],
    children: []
  },
  {
    id: 'component:Marketplace',
    name: 'Marketplace',
    file: 'client/src/features/buyer/Marketplace.tsx',
    props: ['onNavigate: (view: string, params?: any) => void'],
    state: ['batches: ProduceBatch[]', 'products: Product[]', 'loading: boolean', 'searchQuery: string', 'selectedCategory: string', 'selectedGrade: string', 'selectedFreshness: string', 'maxPrice: string', 'sortBy: string', 'isFilterDrawerOpen: boolean', 'activeDetailBatch: ProduceBatch | null', 'directCheckoutItem: DirectCheckoutItem | null', 'isCheckoutModalOpen: boolean', 'selectedBatchForOffer: ProduceBatch | null', 'offerPrice: string', 'offerQuantity: string', 'offerNotes: string', 'submittingOffer: boolean', 'toastMessage: string | null'],
    events: ['handleAddToCart', 'handleBuyNow', 'handleOpenOfferModal', 'handleSendOffer', 'onNavigate'],
    hooks: ['useLanguage', 'useCart'],
    apisCalled: ['api.getMarketplaceProduce', 'api.getFarmerProducts', 'api.sendBuyerOffer'],
    children: ['component:FreshnessBadge', 'component:ProductDetailPage', 'component:CheckoutModal']
  },
  {
    id: 'component:PostDemand',
    name: 'PostDemand',
    file: 'client/src/features/buyer/PostDemand.tsx',
    props: ['onNavigate: (view: string, params?: any) => void'],
    state: ['products: Product[]', 'selectedProductId: string', 'requiredQuantity: string', 'minBudget: string', 'maxBudget: string', 'requiredGrade: string', 'maxDistanceKm: string', 'deliveryDeadline: string', 'location: string', 'notes: string', 'loading: boolean', 'searchingMatches: boolean', 'error: string | null'],
    events: ['handleProductChange', 'handleSubmit', 'onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getFarmerProducts', 'api.postBuyerDemand'],
    children: []
  },
  {
    id: 'component:SmartMatches',
    name: 'SmartMatches',
    file: 'client/src/features/buyer/SmartMatches.tsx',
    props: ['demandId?: string', 'onNavigate: (view: string, params?: any) => void'],
    state: ['demand: BuyerDemand | null', 'individualMatches: MatchedBatch[]', 'collectiveGroup: CollectiveMatchGroup | null', 'loading: boolean', 'establishingOrder: boolean', 'agreedPrice: string', 'error: string | null'],
    events: ['loadMatches', 'handleEstablishCollectiveOrder', 'onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getBuyerDemands', 'api.getDemandMatches', 'api.createCollectiveOrder'],
    children: []
  },
  {
    id: 'component:ProductDetailPage',
    name: 'ProductDetailPage',
    file: 'client/src/features/buyer/ProductDetailPage.tsx',
    props: ['batch: any', 'onClose: () => void', 'onBuyNow: (batch: any, quantity: number) => void'],
    state: ['quantity: number', 'addingToCart: boolean', 'addedToast: boolean'],
    events: ['handleIncrement', 'handleDecrement', 'handleAddToCart', 'onBuyNow', 'onClose'],
    hooks: ['useLanguage', 'useCart'],
    apisCalled: [],
    children: ['component:FreshnessBadge']
  },
  {
    id: 'component:CartDrawer',
    name: 'CartDrawer',
    file: 'client/src/features/buyer/CartDrawer.tsx',
    props: ['onProceedToCheckout: () => void', 'onExplore: () => void'],
    state: [],
    events: ['updateQuantity', 'removeItem', 'clearCart', 'closeCart', 'onProceedToCheckout', 'onExplore'],
    hooks: ['useLanguage', 'useCart'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:CheckoutModal',
    name: 'CheckoutModal',
    file: 'client/src/features/buyer/CheckoutModal.tsx',
    props: ['isOpen: boolean', 'onClose: () => void', 'directItem?: DirectCheckoutItem | null', 'onOrderSuccess: (orderId: string) => void'],
    state: ['address: string', 'phone: string', 'paymentMethod: "UPI" | "NET_BANKING" | "ESCROW" | "COD"', 'notes: string', 'isSubmitting: boolean', 'errorMessage: string | null'],
    events: ['handleSubmitOrder', 'onClose'],
    hooks: ['useLanguage', 'useCart', 'useAuth'],
    apisCalled: ['api.checkout'],
    children: []
  },
  {
    id: 'component:BuyerOrders',
    name: 'BuyerOrders',
    file: 'client/src/features/buyer/BuyerOrders.tsx',
    props: ['highlightOrderId?: string', 'onNavigate: (view: string, params?: any) => void'],
    state: ['orders: Order[]', 'expandedOrderId: string | null', 'loading: boolean', 'advancingStatus: boolean', 'ratingScore: number', 'ratingComment: string', 'ratingSubmitted: boolean'],
    events: ['handleAdvanceOrder', 'handleRatingSubmit', 'onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getBuyerOrders', 'api.updateOrderStatus', 'api.submitRating'],
    children: ['component:DeliveryMap']
  },

  // Coordinator, Logistics & Admin Components
  {
    id: 'component:CoordinatorDashboard',
    name: 'CoordinatorDashboard',
    file: 'client/src/features/coordinator/CoordinatorDashboard.tsx',
    props: [],
    state: ['farmers: any[]', 'loading: boolean', 'showRegModal: boolean', 'newFarmerName: string', 'newFarmerMobile: string', 'newFarmerVillage: string', 'newFarmerLand: string', 'regSuccess: any', 'voiceFarmerId: string | null', 'showVoiceModal: boolean'],
    events: ['handleRegisterFarmer', 'loadFarmers'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getCoordinatorFarmers', 'api.coordinatorRegisterFarmer'],
    children: ['component:VoiceListingModal']
  },
  {
    id: 'component:LogisticsDashboard',
    name: 'LogisticsDashboard',
    file: 'client/src/features/logistics/LogisticsDashboard.tsx',
    props: [],
    state: ['pickups: any[]', 'deliveries: any[]', 'vehicles: any[]', 'centers: any[]', 'loading: boolean', 'showQcModal: boolean', 'qcOrderId: string', 'qcBatchId: string', 'qcExpectedQty: string', 'qcActualQty: string', 'qcDamagedQty: string', 'qcGrade: string', 'qcRemarks: string', 'qcSuccessMsg: string | null'],
    events: ['handleQualityCheckSubmit', 'loadData'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getPickups', 'api.getDeliveries', 'api.getVehicles', 'api.getCollectionCenters', 'api.submitQualityCheck'],
    children: ['component:DeliveryMap']
  },
  {
    id: 'component:AdminDashboard',
    name: 'AdminDashboard',
    file: 'client/src/features/admin/AdminDashboard.tsx',
    props: [],
    state: ['data: any', 'farmers: any[]', 'buyers: any[]', 'disputes: any[]', 'activeTab: "overview" | "farmers" | "buyers" | "disputes"', 'loading: boolean', 'resolvingDisputeId: string | null', 'resolutionNotes: string'],
    events: ['handleResolveDispute', 'loadData'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getAdminDashboard', 'api.getAdminFarmers', 'api.getAdminBuyers', 'api.getAdminDisputes', 'api.resolveDispute'],
    children: []
  },

  // Public & Auth Components
  {
    id: 'component:LandingPage',
    name: 'LandingPage',
    file: 'client/src/features/public/LandingPage.tsx',
    props: ['onNavigate: (view: string) => void', 'onOpenVoiceModal: () => void'],
    state: ['mandis: MandiInfo[]', 'selectedMandiId: string', 'searchQuery: string', 'ratesData: VegetableMarketRate[]', 'summaryMeta: any', 'loadingRates: boolean'],
    events: ['fetchMarketRates', 'onNavigate', 'onOpenVoiceModal'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getDailyMarketPrices'],
    children: []
  },
  {
    id: 'component:HowItWorksPage',
    name: 'HowItWorksPage',
    file: 'client/src/features/public/HowItWorksPage.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: [],
    events: ['onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:MarketRatesPage',
    name: 'MarketRatesPage',
    file: 'client/src/features/public/MarketRatesPage.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: ['mandis: MandiInfo[]', 'selectedMandiId: string', 'selectedCategory: string', 'searchQuery: string', 'viewMode: "grid" | "table"', 'ratesData: VegetableMarketRate[]', 'summaryMeta: any', 'loading: boolean'],
    events: ['fetchRates', 'onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: ['api.getDailyMarketPrices'],
    children: []
  },
  {
    id: 'component:ForFarmersPage',
    name: 'ForFarmersPage',
    file: 'client/src/features/public/ForFarmersPage.tsx',
    props: ['onNavigate: (view: string) => void', 'onOpenVoiceModal: () => void'],
    state: [],
    events: ['onNavigate', 'onOpenVoiceModal'],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:ForBuyersPage',
    name: 'ForBuyersPage',
    file: 'client/src/features/public/ForBuyersPage.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: [],
    events: ['onNavigate'],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:ImpactPage',
    name: 'ImpactPage',
    file: 'client/src/features/public/ImpactPage.tsx',
    props: [],
    state: [],
    events: [],
    hooks: ['useLanguage'],
    apisCalled: [],
    children: []
  },
  {
    id: 'component:LoginPage',
    name: 'LoginPage',
    file: 'client/src/features/public/LoginPage.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: ['emailOrMobile: string', 'password: string', 'loading: boolean', 'error: string | null'],
    events: ['handleLogin', 'handleQuickPersona', 'onNavigate'],
    hooks: ['useAuth', 'useLanguage'],
    apisCalled: ['api.login', 'api.demoSwitch'],
    children: []
  },
  {
    id: 'component:RegisterPage',
    name: 'RegisterPage',
    file: 'client/src/features/public/RegisterPage.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: ['role: "FARMER" | "BUYER" | "COORDINATOR"', 'name: string', 'email: string', 'mobile: string', 'password: string', 'village: string', 'district: string', 'landSize: string', 'businessName: string', 'businessType: string', 'gstNumber: string', 'address: string', 'loading: boolean', 'error: string | null'],
    events: ['handleSubmit', 'onNavigate'],
    hooks: ['useAuth', 'useLanguage'],
    apisCalled: ['api.register'],
    children: []
  },
  {
    id: 'component:ProfilePage',
    name: 'ProfilePage',
    file: 'client/src/features/public/ProfilePage.tsx',
    props: ['onNavigate: (view: string) => void'],
    state: [],
    events: ['onNavigate', 'logout'],
    hooks: ['useAuth', 'useLanguage'],
    apisCalled: [],
    children: []
  }
];

// Register all components and their relationships
uiComponentsDetailed.forEach(comp => {
  addNode({
    id: comp.id,
    type: 'ui_component',
    name: comp.name,
    file: comp.file,
    source: comp.file,
    props: comp.props,
    state: comp.state,
    events: comp.events,
    hooks: comp.hooks,
    apisCalled: comp.apisCalled,
    children: comp.children,
    description: `UI Component ${comp.name} in ${comp.file}`
  });

  // Relationships: hook usage
  comp.hooks.forEach(h => {
    addRel(comp.id, 'uses_hook', `hook:${h}`);
  });

  // Relationships: children rendering
  comp.children.forEach(child => {
    addRel(comp.id, 'renders', child);
  });

  // Relationships: API calls
  comp.apisCalled.forEach(apiCall => {
    addRel(comp.id, 'invokes_client_api', apiCall);
  });
});

// Compile and output JSON
const uiGraph = {
  version: '1.0.0',
  title: 'KisanDirect Full UI Knowledge Graph',
  generatedAt: new Date().toISOString(),
  stats: {
    totalUiNodes: uiNodes.length,
    totalUiRelationships: uiRelationships.length,
    breakdown: uiNodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {})
  },
  nodes: uiNodes,
  relationships: uiRelationships
};

const outputPath = path.join(knowledgeDir, 'ui-knowledge-graph.json');
fs.writeFileSync(outputPath, JSON.stringify(uiGraph, null, 2), 'utf-8');

console.log(`✅ UI Knowledge Graph successfully built at: ${outputPath}`);
console.log(`📊 UI Nodes: ${uiNodes.length}`);
console.log(`🔗 UI Relationships: ${uiRelationships.length}`);
console.log('📈 Breakdown:', uiGraph.stats.breakdown);

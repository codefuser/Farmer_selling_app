import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/common/Navbar';
import MobileBottomNav from './components/common/MobileBottomNav';
import DemoScenarioBar from './components/common/DemoScenarioBar';
import VoiceListingModal from './components/common/VoiceListingModal';
import SplashScreen from './components/common/SplashScreen';
import OnboardingView from './components/common/OnboardingView';
import CartDrawer from './features/buyer/CartDrawer';
import CheckoutModal from './features/buyer/CheckoutModal';
import api from './services/api';

// Public Pages
import LandingPage from './features/public/LandingPage';
import HowItWorksPage from './features/public/HowItWorksPage';
import ForFarmersPage from './features/public/ForFarmersPage';
import ForBuyersPage from './features/public/ForBuyersPage';
import ImpactPage from './features/public/ImpactPage';
import LoginPage from './features/public/LoginPage';
import RegisterPage from './features/public/RegisterPage';
import MarketRatesPage from './features/public/MarketRatesPage';
import ProfilePage from './features/public/ProfilePage';

// Phase 1 Social Feed, Public Farmer Profile, Product Detail & Chat
import HomeFeed from './features/feed/HomeFeed';
import FarmerPublicProfile from './features/farmer/FarmerPublicProfile';
import ProductDetailPage from './features/buyer/ProductDetailPage';
import ChatDrawer from './features/chat/ChatDrawer';

// Farmer Pages
import FarmerDashboard from './features/farmer/FarmerDashboard';
import MyProduce from './features/farmer/MyProduce';
import AddProduce from './features/farmer/AddProduce';
import FarmerOffers from './features/farmer/FarmerOffers';
import FarmerCollective from './features/farmer/FarmerCollective';
import FarmerOrders from './features/farmer/FarmerOrders';
import FarmerEarnings from './features/farmer/FarmerEarnings';

// Buyer Pages
import BuyerDashboard from './features/buyer/BuyerDashboard';
import Marketplace from './features/buyer/Marketplace';
import PostDemand from './features/buyer/PostDemand';
import SmartMatches from './features/buyer/SmartMatches';
import BuyerOrders from './features/buyer/BuyerOrders';

// Coordinator & Logistics & Admin
import CoordinatorDashboard from './features/coordinator/CoordinatorDashboard';
import LogisticsDashboard from './features/logistics/LogisticsDashboard';
import AdminDashboard from './features/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { user, demoSwitch } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home-feed');
  const [viewParams, setViewParams] = useState<any>(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Chat Drawer state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [chatTargetUser, setChatTargetUser] = useState<any>(null);

  // Splash & Onboarding state
  const [showSplash, setShowSplash] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return !!localStorage.getItem('kisandirect_onboarded');
  });

  // Global Checkout Modal state from CartDrawer
  const [isGlobalCheckoutOpen, setIsGlobalCheckoutOpen] = useState(false);

  // Sync initial view to home-feed if authenticated
  useEffect(() => {
    if (user) {
      if (currentView === 'landing' || currentView === 'login' || currentView === 'register') {
        setCurrentView('home-feed');
      }
    }
  }, [user]);

  const navigate = (view: string, params?: any) => {
    setCurrentView(view);
    setViewParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scenario 1: Hotel Needs 500kg Tomatoes (Bulk Demand & Collective Supply)
  const handleTriggerScenario1 = async () => {
    await demoSwitch('BUYER');
    navigate('buyer-smart-matches');
  };

  // Scenario 2: Perishable Freshness & Urgent Sale Decay Simulation
  const handleTriggerScenario2 = async () => {
    try {
      await api.simulateUrgency();
      await demoSwitch('FARMER');
      navigate('farmer-produce');
    } catch (err) {
      console.error(err);
      navigate('farmer-produce');
    }
  };

  // Scenario 3: Village Coordinator Assisted Voice Listing
  const handleTriggerScenario3 = async () => {
    await demoSwitch('COORDINATOR');
    navigate('coordinator-dashboard');
    setVoiceModalOpen(true);
  };

  // Onboarding completion
  const handleOnboardingComplete = async (selectedRole?: string) => {
    setHasOnboarded(true);
    localStorage.setItem('kisandirect_onboarded', 'true');
    if (selectedRole) {
      await demoSwitch(selectedRole);
      navigate('home-feed');
    } else {
      navigate('home-feed');
    }
  };

  const renderView = () => {
    switch (currentView) {
      // Social & Farmer-First Primary Feed
      case 'home-feed':
      case 'feed':
        return (
          <HomeFeed
            onNavigate={navigate}
            onOpenChat={(convId, targetUser) => {
              setChatConversationId(convId || null);
              setChatTargetUser(targetUser || null);
              setChatOpen(true);
            }}
          />
        );
      case 'farmer-profile':
      case 'farmer-public-profile':
        return (
          <FarmerPublicProfile
            farmerId={viewParams?.farmerId || (user?.role === 'FARMER' ? user?.id : undefined)}
            onNavigate={navigate}
            onOpenChat={(targetUser) => {
              setChatTargetUser(targetUser);
              setChatConversationId(null);
              setChatOpen(true);
            }}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailPage
            productId={viewParams?.productId}
            onNavigate={navigate}
            onOpenChat={(targetUser) => {
              setChatTargetUser(targetUser);
              setChatConversationId(null);
              setChatOpen(true);
            }}
          />
        );

      // Public Views
      case 'landing':
        return <LandingPage onNavigate={navigate} onOpenVoiceModal={() => setVoiceModalOpen(true)} />;
      case 'how-it-works':
        return <HowItWorksPage onNavigate={navigate} />;
      case 'market-rates':
        return <MarketRatesPage onNavigate={navigate} />;
      case 'for-farmers':
        return <ForFarmersPage onNavigate={navigate} onOpenVoiceModal={() => setVoiceModalOpen(true)} />;
      case 'for-buyers':
        return <ForBuyersPage onNavigate={navigate} />;
      case 'impact':
        return <ImpactPage />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;

      // Farmer Views
      case 'farmer-dashboard':
        return <FarmerDashboard onNavigate={navigate} onOpenVoiceModal={() => setVoiceModalOpen(true)} />;
      case 'farmer-produce':
        return <MyProduce onNavigate={navigate} onOpenVoiceModal={() => setVoiceModalOpen(true)} />;
      case 'farmer-add-produce':
        return <AddProduce onNavigate={navigate} />;
      case 'farmer-offers':
        return <FarmerOffers />;
      case 'farmer-collective':
        return <FarmerCollective />;
      case 'farmer-orders':
        return <FarmerOrders />;
      case 'farmer-earnings':
        return <FarmerEarnings />;

      // Buyer Views
      case 'buyer-dashboard':
        return <BuyerDashboard onNavigate={navigate} />;
      case 'buyer-marketplace':
        return <Marketplace onNavigate={navigate} />;
      case 'buyer-post-demand':
        return <PostDemand onNavigate={navigate} />;
      case 'buyer-smart-matches':
      case 'buyer-matches':
        return <SmartMatches demandId={viewParams?.demandId} onNavigate={navigate} />;
      case 'buyer-orders':
        return <BuyerOrders highlightOrderId={viewParams?.highlightOrderId || viewParams?.orderId} onNavigate={navigate} />;

      // Other Role Views
      case 'coordinator-dashboard':
      case 'coordinator-farmers':
      case 'coordinator-voice':
        return <CoordinatorDashboard />;
      case 'logistics-dashboard':
      case 'logistics-pickups':
      case 'logistics-tracking':
        return <LogisticsDashboard />;
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-disputes':
        return <AdminDashboard />;

      default:
        return (
          <HomeFeed
            onNavigate={navigate}
            onOpenChat={(convId, targetUser) => {
              setChatConversationId(convId || null);
              setChatTargetUser(targetUser || null);
              setChatOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9] text-slate-800">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Onboarding View (first time visitors who haven't completed onboarding) */}
      {!showSplash && !hasOnboarded && !user && (
        <OnboardingView onComplete={handleOnboardingComplete} />
      )}

      {/* Top Demo Presentation Bar */}
      <DemoScenarioBar
        onTriggerScenario1={handleTriggerScenario1}
        onTriggerScenario2={handleTriggerScenario2}
        onTriggerScenario3={handleTriggerScenario3}
      />

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        onOpenChat={() => {
          setChatConversationId(null);
          setChatTargetUser(null);
          setChatOpen(true);
        }}
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16 md:pb-8">{renderView()}</main>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsGlobalCheckoutOpen(true)}
        onExplore={() => navigate('buyer-marketplace')}
      />

      {/* Global Checkout Modal */}
      {isGlobalCheckoutOpen && (
        <CheckoutModal
          isOpen={isGlobalCheckoutOpen}
          onClose={() => setIsGlobalCheckoutOpen(false)}
          onOrderSuccess={(orderId) => {
            setIsGlobalCheckoutOpen(false);
            navigate('buyer-orders', { highlightOrderId: orderId });
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={navigate}
        onOpenChat={() => {
          setChatConversationId(null);
          setChatTargetUser(null);
          setChatOpen(true);
        }}
      />

      {/* 1-on-1 Chat Drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        conversationId={chatConversationId}
        initialTargetUser={chatTargetUser}
      />

      {/* Global Voice Listing Simulation Modal */}
      <VoiceListingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onBatchCreated={() => {
          if (user?.role === 'FARMER') navigate('farmer-produce');
          else if (user?.role === 'COORDINATOR') navigate('coordinator-dashboard');
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-extrabold text-slate-200 text-sm">KisanDirect</span> · Community-Powered Direct Agricultural Marketplace
            <div className="text-[11px] text-slate-500 mt-0.5">
              Smart India Hackathon 2026 · Problem Statement ID: SIH26033
            </div>
          </div>
          <div className="text-slate-500 text-[11px] text-center sm:text-right">
            Designed for Salem District Agricultural Corridor · Tamil Nadu
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;

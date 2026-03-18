import "@/themes/linea-minimal"; // Register theme before render
import "@/themes/ecommerce-br"; // Register ecommerce-br theme
import "@/themes/bloom-beauty"; // Register bloom beauty theme
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import PageViewTracker from "./components/PageViewTracker";
import ThemeApplicator from "./components/ThemeApplicator";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeSyncProvider } from "./hooks/useActiveThemeSync";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import OurStory from "./pages/about/OurStory";
import Sustainability from "./pages/about/Sustainability";
import SizeGuide from "./pages/about/SizeGuide";
import CustomerCare from "./pages/about/CustomerCare";
import StoreLocator from "./pages/about/StoreLocator";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminThemeEditor from "./pages/admin/AdminThemeEditor";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminOrderBumps from "./pages/admin/AdminOrderBumps";
import AdminPages from "./pages/admin/AdminPages";
import AdminThemes from "./pages/admin/AdminThemes";
import DynamicPage from "./pages/DynamicPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeSyncProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <PageViewTracker />
            <ThemeApplicator />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:category" element={<Category />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about/our-story" element={<OurStory />} />
              <Route path="/about/sustainability" element={<Sustainability />} />
              <Route path="/about/size-guide" element={<SizeGuide />} />
              <Route path="/about/customer-care" element={<CustomerCare />} />
              <Route path="/about/store-locator" element={<StoreLocator />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="theme" element={<AdminThemeEditor />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="order-bumps" element={<AdminOrderBumps />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="themes" element={<AdminThemes />} />
              </Route>
              <Route path="/page/:slug" element={<DynamicPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeSyncProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

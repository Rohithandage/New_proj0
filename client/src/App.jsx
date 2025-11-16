import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PriceComparisonLayout from "./components/price-comparison/layout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

// Lazy load routes for better initial load performance
const Home = lazy(() => import("./pages/price-comparison/home"));
const Search = lazy(() => import("./pages/price-comparison/search"));
const ProductDetails = lazy(() => import("./pages/price-comparison/product-details"));
const AboutUs = lazy(() => import("./pages/price-comparison/about"));
const ContactUs = lazy(() => import("./pages/price-comparison/contact"));
const PrivacyPolicy = lazy(() => import("./pages/price-comparison/privacy-policy"));
const TermsOfService = lazy(() => import("./pages/price-comparison/terms-of-service"));
const UserLogin = lazy(() => import("./pages/auth/login"));
const UserRegister = lazy(() => import("./pages/auth/register"));
const AdminLogin = lazy(() => import("./pages/admin-view/login"));
const AdminDashboard = lazy(() => import("./pages/admin-view/dashboard"));
const AddProduct = lazy(() => import("./pages/admin-view/add-product"));
const EditProduct = lazy(() => import("./pages/admin-view/edit-product"));
const Products = lazy(() => import("./pages/admin-view/products"));
const Settings = lazy(() => import("./pages/admin-view/settings"));
const ApiManagement = lazy(() => import("./pages/admin-view/api-management"));
const WebScraping = lazy(() => import("./pages/admin-view/web-scraping"));
const NotFound = lazy(() => import("./pages/not-found"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        {/* Price Comparison Routes */}
        <Route path="/" element={<PriceComparisonLayout />}>
          <Route 
            index 
            element={
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            } 
          />
          <Route 
            path="search" 
            element={
              <Suspense fallback={<PageLoader />}>
                <Search />
              </Suspense>
            } 
          />
          <Route 
            path="product/:productId" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ProductDetails />
              </Suspense>
            } 
          />
          <Route 
            path="about" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AboutUs />
              </Suspense>
            } 
          />
          <Route 
            path="contact" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ContactUs />
              </Suspense>
            } 
          />
          <Route 
            path="privacy-policy" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicy />
              </Suspense>
            } 
          />
          <Route 
            path="terms-of-service" 
            element={
              <Suspense fallback={<PageLoader />}>
                <TermsOfService />
              </Suspense>
            } 
          />
        </Route>
        
        {/* User Auth Routes */}
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<PageLoader />}>
              <UserLogin />
            </Suspense>
          } 
        />
        <Route 
          path="/register" 
          element={
            <Suspense fallback={<PageLoader />}>
              <UserRegister />
            </Suspense>
          } 
        />
        
        {/* Admin Routes - Public */}
        <Route 
          path="/admin/login" 
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLogin />
            </Suspense>
          } 
        />
        
        {/* Admin Routes - Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <AddProduct />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-product/:productId"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <EditProduct />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Products />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/api-management"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ApiManagement />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/web-scraping"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <WebScraping />
              </Suspense>
            </AdminProtectedRoute>
          }
        />
        
        <Route 
          path="*" 
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

const PriceComparisonLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PriceComparisonLayout;


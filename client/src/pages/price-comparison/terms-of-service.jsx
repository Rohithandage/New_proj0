import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertCircle, Shield, CheckCircle, XCircle, Gavel } from "lucide-react";
import SEO from "@/components/seo/SEO";

const TermsOfService = () => {
  const sections = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Acceptance of Terms",
      content: [
        "By accessing or using ClothNest, you agree to be bound by these Terms of Service",
        "You must be at least 18 years old or have parental consent to use our service",
        "If you disagree with any part of these terms, you may not access the service",
        "We reserve the right to update these terms at any time"
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Use of Service",
      content: [
        "You may use our service for personal, non-commercial purposes only",
        "You agree not to use the service for any illegal or unauthorized purpose",
        "You must not interfere with or disrupt the service or servers",
        "You are responsible for maintaining the confidentiality of your account"
      ]
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      title: "Disclaimer of Warranties",
      content: [
        "We provide price comparison information \"as is\" without warranties",
        "We do not guarantee the accuracy or completeness of price data",
        "Prices are subject to change and may vary by platform",
        "We are not responsible for transactions made on third-party websites"
      ]
    },
    {
      icon: <Gavel className="h-6 w-6 text-purple-600" />,
      title: "Limitation of Liability",
      content: [
        "ClothNest shall not be liable for any indirect or consequential damages",
        "We are not responsible for products purchased through third-party platforms",
        "Our liability is limited to the maximum extent permitted by law",
        "You acknowledge that you use the service at your own risk"
      ]
    },
    {
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      title: "Prohibited Activities",
      content: [
        "Attempting to hack, breach, or compromise our service security",
        "Using automated tools to scrape or harvest data from our platform",
        "Posting false, misleading, or malicious content",
        "Violating any applicable laws or regulations"
      ]
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-teal-600" />,
      title: "Intellectual Property",
      content: [
        "All content on ClothNest is protected by copyright and trademark laws",
        "You may not reproduce, distribute, or create derivative works",
        "Product images and descriptions are the property of their respective owners",
        "Our logo and branding are trademarks of ClothNest"
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Terms of Service - ClothNest | User Agreement & Terms"
        description="Read ClothNest's Terms of Service to understand your rights and obligations when using our price comparison service. Learn about service usage, limitations, and user responsibilities."
        keywords="terms of service, user agreement, terms and conditions, service terms, ClothNest terms, legal agreement"
        url="/terms-of-service"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-pink-600/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6">
                <Gavel className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
                Please read these terms carefully before using our service.
              </p>
              <p className="text-sm md:text-base text-purple-200 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-indigo-100 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    These Terms of Service ("Terms") govern your access to and use of ClothNest, a price comparison 
                    platform that helps you find the best deals on clothing products across multiple e-commerce platforms.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By accessing or using our service, you agree to be bound by these Terms. If you do not agree to 
                    these Terms, please do not use our service. We reserve the right to modify these Terms at any time, 
                    and such modifications will be effective immediately upon posting.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Terms Sections */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {sections.map((section, index) => (
                <Card key={index} className="border-2 border-gray-100 hover:border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {section.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Account Terms */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-purple-100 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Account Terms</h2>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <p className="leading-relaxed">
                      When you create an account with ClothNest, you must provide accurate and complete information. 
                      You are responsible for maintaining the security of your account and password.
                    </p>
                    <p className="leading-relaxed">
                      You are responsible for all activities that occur under your account. You must immediately notify 
                      us of any unauthorized use of your account.
                    </p>
                    <p className="leading-relaxed">
                      We reserve the right to suspend or terminate your account if you violate these Terms or engage 
                      in any prohibited activities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Price Alerts */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-amber-200 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Price Alert Service</h2>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <p className="leading-relaxed">
                      Our price alert service notifies you when product prices drop to your specified range. 
                      While we strive for accuracy, we cannot guarantee that all price alerts will be timely or complete.
                    </p>
                    <p className="leading-relaxed">
                      Prices displayed on our platform are provided for informational purposes only and may not reflect 
                      the actual price at the time of purchase. We recommend verifying prices directly on the seller's website.
                    </p>
                    <p className="leading-relaxed">
                      ClothNest is not responsible for any transactions made on third-party platforms. All purchases 
                      are subject to the terms and conditions of the respective e-commerce platforms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-indigo-200 shadow-xl">
                <CardContent className="p-6 md:p-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Questions About Terms?</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us for clarification.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:info@clothnest.com"
                      className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Contact Us
                    </a>
                    <a
                      href="/contact"
                      className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors border-2 border-indigo-200"
                    >
                      Visit Contact Page
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TermsOfService;




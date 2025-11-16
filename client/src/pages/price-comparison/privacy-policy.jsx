import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, User, FileText, CheckCircle } from "lucide-react";
import SEO from "@/components/seo/SEO";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Information We Collect",
      content: [
        "Personal information such as name and email address when you register or create alerts",
        "Search queries and browsing behavior to improve our service",
        "Product preferences and price alert settings",
        "Technical information including IP address, browser type, and device information"
      ]
    },
    {
      icon: <Eye className="h-6 w-6 text-purple-600" />,
      title: "How We Use Your Information",
      content: [
        "To provide price comparison services and send price drop notifications",
        "To improve our platform and user experience",
        "To communicate with you about your account and services",
        "To analyze usage patterns and optimize our website performance"
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Data Protection",
      content: [
        "We implement industry-standard security measures to protect your data",
        "Your personal information is encrypted during transmission",
        "We do not sell your personal information to third parties",
        "Access to your data is restricted to authorized personnel only"
      ]
    },
    {
      icon: <User className="h-6 w-6 text-orange-600" />,
      title: "Your Rights",
      content: [
        "Access and review your personal information",
        "Update or correct your account information",
        "Delete your account and associated data",
        "Opt-out of marketing communications"
      ]
    },
    {
      icon: <Lock className="h-6 w-6 text-red-600" />,
      title: "Cookies and Tracking",
      content: [
        "We use cookies to enhance your browsing experience",
        "Cookies help us remember your preferences and settings",
        "You can control cookie settings through your browser",
        "Third-party cookies may be used for analytics purposes"
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Privacy Policy - ClothNest | Your Data Protection Rights"
        description="Read ClothNest's privacy policy to understand how we collect, use, and protect your personal information. Learn about your privacy rights and data protection measures."
        keywords="privacy policy, data protection, user privacy, information security, personal data, ClothNest privacy"
        url="/privacy-policy"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Your privacy is important to us. Learn how we protect your personal information.
              </p>
              <p className="text-sm md:text-base text-blue-200 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    At ClothNest, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                    price comparison service.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By using ClothNest, you agree to the collection and use of information in accordance with this policy. 
                    If you do not agree with our policies and practices, please do not use our service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {sections.map((section, index) => (
                <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
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

        {/* Third-Party Services */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-purple-100 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Third-Party Services</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Our service may contain links to third-party websites and services. We are not responsible for the 
                    privacy practices of these external sites. We encourage you to read the privacy policies of any 
                    third-party services you visit.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    We may use third-party analytics services to understand how our service is used and to improve 
                    user experience. These services may collect information about your use of our service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-blue-200 shadow-xl">
                <CardContent className="p-6 md:p-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    If you have any questions about this Privacy Policy or our data practices, please contact us.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:info@clothnest.com"
                      className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Contact Us
                    </a>
                    <a
                      href="/contact"
                      className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-200"
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

export default PrivacyPolicy;




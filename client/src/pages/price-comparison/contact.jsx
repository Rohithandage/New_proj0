import { useState } from "react";
import { Mail, Phone, MapPin, Send, ShoppingBag, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/seo/SEO";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "clothnest99@gmail.com",
      description: "Send us an email and we'll respond within 24 hours"
    },
    // {
    //   icon: <Phone className="h-6 w-6" />,
    //   title: "Phone",
    //   details: "+1 (555) 123-4567",
    //   description: "Call us during business hours (9 AM - 6 PM EST)"
    // },
    // {
    //   icon: <MapPin className="h-6 w-6" />,
    //   title: "Address",
    //   details: "123 Tech Street, Digital City, DC 12345",
    //   description: "Visit our office for in-person support"
    // }
  ];

  return (
    <>
      <SEO
        title="Contact Us - PriceCompare | Get in Touch"
        description="Contact PriceCompare for any queries, suggestions, or support. We're here to help you find the best deals and save money on your shopping."
        keywords="contact price comparison, support, customer service, help, questions, feedback"
        url="/contact"
      />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 px-2">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  className="text-sm sm:text-base min-h-[120px] sm:min-h-[150px]"
                />
              </div>

              <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Get in Touch</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
              Have a question about our price comparison service? Need help finding the best deals? 
              We're here to help! Reach out to us through any of the channels below.
            </p>

            <div className="space-y-4 sm:space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-lg">
                          {info.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg text-blue-600 font-medium mb-1 sm:mb-2 break-words">
                          {info.details}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Your Brand Section */}
            <div className="mt-8 sm:mt-12">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-md">
                        <Handshake className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                        Add Your Clothing Brand
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-3 sm:mb-4">
                        Are you a clothing brand or seller looking to showcase your products on ClothNest? 
                        We'd love to partner with you!
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
                        Join our platform and reach thousands of customers who are actively searching for 
                        the best deals on clothing. Get your products featured alongside major e-commerce platforms.
                      </p>
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200 mb-3 sm:mb-4">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                          <span>Benefits of Partnering with Us:</span>
                        </h4>
                        <ul className="space-y-1.5 sm:space-y-2 text-gray-600 text-xs sm:text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                            <span>Reach a wider audience of price-conscious shoppers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                            <span>Get your products featured alongside major platforms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                            <span>Increase visibility and sales through price comparison</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                            <span>Easy product listing and management</span>
                          </li>
                        </ul>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 font-semibold mb-2">
                        Interested? Connect with us by filling out the contact form or emailing us directly at:
                      </p>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 sm:p-3 border border-blue-200">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <a 
                          href="mailto:clothnest99@gmail.com?subject=Interested in Adding My Clothing Brand" 
                          className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-semibold underline break-all"
                        >
                          clothnest99@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 sm:mt-12">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h3>
              <div className="space-y-3 sm:space-y-4">
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">How often are prices updated?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-sm sm:text-base text-gray-600">
                      We update prices in real-time from our partner platforms. You can also manually 
                      refresh prices on any product page to get the latest information.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Is ClothNest free to use?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-sm sm:text-base text-gray-600">
                      Yes! Our price comparison service is completely free. We don't charge any fees 
                      for using our platform to find the best deals.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">How do I buy a product?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-sm sm:text-base text-gray-600">
                      When you find a product you like, click the "Buy from [Platform]" button. 
                      This will take you directly to the e-commerce platform where you can complete your purchase.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;



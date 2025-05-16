
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        
        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About This Project</h2>
              <p className="text-xl text-gray-600 mb-10">
                This is a blank slate project built with React, TypeScript, and Tailwind CSS.
                It's designed to give you a head start on your next web application.
              </p>
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <p className="text-gray-700 italic">
                  "Starting with a clean, well-structured foundation is the key to building great web applications.
                  This project template provides everything you need to get up and running quickly."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <p className="text-xl text-gray-600 mb-10">
                Have questions or want to learn more? Reach out to us.
              </p>
              <a 
                href="mailto:contact@yourapp.com" 
                className="inline-block px-6 py-3 bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium rounded-lg transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

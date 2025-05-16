
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Amazing <span className="text-[#9b87f5]">Application</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-10">
            Build something amazing with this blank slate project. Start creating the app of your dreams right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white px-6">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-gray-700 border-gray-300 px-6">
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-3xl h-64 bg-gradient-to-b from-[#E5DEFF] to-[#F5F3FF] rounded-xl shadow-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

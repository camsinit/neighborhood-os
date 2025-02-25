
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, Heart, Brain } from "lucide-react";

// These feature explanations will be displayed in a clean, minimal layout
const features = [
  {
    title: "Safety Updates",
    description: "Real-time neighborhood alerts and safety coordination",
    icon: Shield,
    color: "text-red-500",
    route: "/safety"
  },
  {
    title: "Community Calendar",
    description: "Organize and discover local events",
    icon: Calendar,
    color: "text-blue-500",
    route: "/calendar"
  },
  {
    title: "Mutual Support",
    description: "Connect with neighbors who need or can offer help",
    icon: Heart,
    color: "text-pink-500",
    route: "/care"
  },
  {
    title: "Skill Sharing",
    description: "Exchange knowledge and expertise within the community",
    icon: Brain,
    color: "text-purple-500",
    route: "/skills"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-red-50 to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-blue-50 to-transparent opacity-50" />
        </div>
        
        <div className="max-w-4xl mx-auto z-10">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Your Neighborhood,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Connected
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A modern platform for neighborhood safety, events, and mutual support.
            Build stronger communities together.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
          >
            Join Your Community
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            Everything your community needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.route}
                className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className={`w-8 h-8 mb-4 ${feature.color}`} />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* We'll need to create custom illustrations for these steps */}
            {[1, 2, 3].map((step) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-gray-900">{step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {step === 1
                    ? "Join your neighborhood"
                    : step === 2
                    ? "Connect with neighbors"
                    : "Engage & contribute"}
                </h3>
                <p className="text-gray-600">
                  {step === 1
                    ? "Create your account and verify your address"
                    : step === 2
                    ? "Meet your community and stay informed"
                    : "Participate in events and help others"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            What neighbors are saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* We'll need real testimonials and profile images */}
            {[1, 2, 3].map((testimonial) => (
              <div
                key={testimonial}
                className="p-6 bg-white rounded-xl shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Neighbor Name</h4>
                    <p className="text-sm text-gray-600">Community Member</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Placeholder testimonial text that highlights the positive impact
                  of using the platform..."
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to join your community?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get started today and connect with your neighbors.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-blue-500 hover:bg-gray-100"
          >
            Create Your Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

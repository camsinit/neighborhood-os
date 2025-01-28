import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to Local Link
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect with your neighbors, share resources, and build a stronger community together.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
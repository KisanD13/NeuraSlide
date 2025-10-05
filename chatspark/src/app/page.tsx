import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="text-white font-bold text-xl">ChatSpark</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="#features"
            className="text-blue-200 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-blue-200 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-blue-200 hover:text-white transition-colors"
          >
            About
          </Link>
        </div>

        <Button
          asChild
          className="bg-white text-primary hover:bg-gray-100 cursor-pointer"
        >
          <Link href="/dashboard">Login</Link>
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
          Transform Your Instagram Engagement with{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ChatSpark
          </span>
        </h1>

        <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
          ChatSpark revolutionizes how you connect with your audience on
          Instagram. Automate responses and boost engagement effortlessly,
          turning interactions into valuable business opportunities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 text-lg cursor-pointer"
          >
            Get Started
          </Button>
          <Button size="lg" className=" px-8 py-3 text-lg cursor-pointer">
            Learn More
          </Button>
        </div>
      </main>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Trusted by Instagram Creators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Sarah Johnson", role: "Fashion Influencer" },
              { name: "Mike Chen", role: "Tech Reviewer" },
              { name: "Emma Rodriguez", role: "Lifestyle Blogger" },
              { name: "Alex Kim", role: "Fitness Coach" },
            ].map((person, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="text-white font-semibold">{person.name}</h3>
                <p className="text-blue-200 text-sm">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-16 px-6 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Free Plan</CardTitle>
                <CardDescription className="text-blue-200">
                  Perfect for getting started
                </CardDescription>
                <div className="text-4xl font-bold text-white">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Boost engagement with target responses
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Automate comment replies to enhance audience interaction
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Turn followers into customers with targeted messaging
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Smart AI Plan */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  Smart AI Plan
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Advanced features for power users
                </CardDescription>
                <div className="text-4xl font-bold text-white">$29</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    All features from Free Plan
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    AI-powered response generation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Advanced analytics and insights
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Priority customer support
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                    Custom branding options
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 text-center">
        <p className="text-blue-200">© 2024 ChatSpark. All rights reserved.</p>
      </footer>
    </div>
  );
}

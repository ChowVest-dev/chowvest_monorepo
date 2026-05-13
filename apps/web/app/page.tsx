import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Lock,
  Wallet,
  Truck,
  Smartphone,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Button } from "@chowvest/ui";
import { LandingNav } from "@/components/landing-nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-y-hidden">
      <LandingNav />

      {/* Promo Banner */}
      {/* <div className="bg-gradient-to-r from-primary to-primary/90 text-white text-center py-3 px-4">
        <p className="text-sm md:text-base">
          <span className="font-bold">🎁 Launch Special:</span> First 100
          members get ₦500 FREE + Zero fees for 3 months! Only 67 spots left
        </p>
      </div>*/}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                Small Savings, Big meals {" "}
                <span className="text-primary">Beat Food Inflation.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                With Chowvest, you can start with as little as ₦500, save
                towards your food, and get your kitchen stocked when you need
                it. No stress, no surprises from rising food prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/">
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base bg-transparent"
                >
                  <Link href="#how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero-groceries.jpg"
                  alt="Nigerian family with groceries"
                  width={600}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                ₦1.2M+
              </div>
              <div className="text-muted-foreground">
                Total Saved by Members
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                47
              </div>
              <div className="text-muted-foreground">Active Savers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                23
              </div>
              <div className="text-muted-foreground">Successful Deliveries</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">
              How Chowvest Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to start saving and beating food inflation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-muted/50 rounded-xl p-8 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Deposit Any Amount</h3>
              <p className="text-muted-foreground">
                Deposit any amount into your Chowvest food wallet. You can even
                set up auto-deductions. Start with as little as ₦500.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-8 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Beat Food Inflation
              </h3>
              <p className="text-muted-foreground">
                Once you've saved enough, your prices stay the same until you're
                ready to buy. Lock today's prices!
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-8 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Home Delivery</h3>
              <p className="text-muted-foreground">
                When your balance completes the price of rice, beans, or garri,
                we deliver straight to your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Food Products */}
      <section id="products" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">
              Start Saving For Your Favorite Foods
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from our quality food products and start building your
              savings today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rice Product */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all">
              <Image
                src="/rice.jpg"
                alt="Rice"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">Rice</h3>
                <p className="text-muted-foreground">
                  Start small, build up. With Chowvest, you'll always have rice
                  ready for your family.
                </p>
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Starting from
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₦500
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/">Get Started</Link>
                </Button>
              </div>
            </div>

            {/* Beans Product */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all">
              <Image
                src="/beans.jpg"
                alt="Beans"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">Beans</h3>
                <p className="text-muted-foreground">
                  Save steadily towards beans without worrying about price
                  increases.
                </p>
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Starting from
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₦500
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/">Get Started</Link>
                </Button>
              </div>
            </div>

            {/* Garri Product */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all">
              <Image
                src="/garri.jpg"
                alt="Garri"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">Garri</h3>
                <p className="text-muted-foreground">
                  Your everyday food, secured. Lock today's price and buy when
                  you're ready.
                </p>
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Starting from
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₦500
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">
              Why Choose Chowvest
            </h2>
            <p className="text-lg text-muted-foreground">
              The smartest way to save for your household food needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <Lock className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Price Lock Protection</h3>
              <p className="text-muted-foreground">
                Save gradually and secure today's price for up to 90 days. If food prices rise, you're covered. If prices drop, you still get the new lower price. No pressure. No bulk buying. Just smart planning.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <Wallet className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Start with ₦500</h3>
              <p className="text-muted-foreground">
                No need for bulk payments. Start small and build up your savings
                at your own pace.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <Truck className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">
                When you complete your savings goal, we deliver your foodstuff
                straight to your doorstep.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <Smartphone className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Track Your Savings</h3>
              <p className="text-muted-foreground">
                See your progress in real-time. Know exactly how much you've
                saved and how close you are to your goal.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Quality Guaranteed</h3>
              <p className="text-muted-foreground">
                We work directly with trusted manufacturers to ensure you get
                the best quality foodstuff.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <Zap className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Flexible Savings</h3>
              <p className="text-muted-foreground">
                Save daily, weekly, or monthly - whatever works for your budget.
                You're in complete control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl opacity-90">
            Join 47 smart Nigerians already beating food inflation with Chowvest
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link href="/">
              Create Your Account Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4 ">
              <div className="w-15 h-15 flex items-center justify-center bg-accent rounded-full">
                <Image src="/chowvest-logo-nobg.png" width={100} height={100} alt="Chowvest logo" className="w-15 h-15 object-contain" />
              </div>
              <h3 className="text-xl font-bold"> Chowvest</h3>
              <p className="text-gray-400 leading-relaxed">
                Save small, eat well. Beat food inflation with smart savings for
                your household food needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link
                  href="#how-it-works"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="#products"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="#features"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link
                  href="#contact"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  href="#help"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
                <Link
                  href="#faq"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link
                  href="#terms"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="#privacy"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Chowvest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import React from 'react';
import Head from 'next/head';
import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import Footer from '@/components/Footer';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlobalCtaButton } from '@/components/GlobalCtaButton';
import { CreditCard, Shield, Clock, Bell } from 'lucide-react';
import { pricingConfig } from '@/lib/billing/pricing';

export default function AccountPage() {
  const premiumPlan = pricingConfig.premium;

  return (
    <div className="min-h-screen relative text-white bg-[#0B1530]">
      <Head>
        <title>Account · Liquilab</title>
        <meta name="description" content="Manage your subscription and settings." />
      </Head>
      
      <WaveBackground>
        <Navigation />
        
        <div className="relative z-10 max-w-[1000px] mx-auto px-4 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-brand text-white mb-2">Account Settings</h1>
            <p className="text-white/60 font-ui">Manage your subscription and preferences.</p>
          </div>

          <div className="grid gap-8">
            {/* Current Plan Card */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-brand text-white mb-1 flex items-center gap-3">
                    Current Plan
                    <Badge variant="outline" className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30">
                      Free Visitor
                    </Badge>
                  </h2>
                  <p className="text-white/50 text-sm font-ui">You are currently on the free plan.</p>
                </div>
                <GlobalCtaButton className="w-full sm:w-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#0B1530]/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <CreditCard className="size-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Status</p>
                    <p className="text-sm text-white font-ui">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Shield className="size-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Pool Limit</p>
                    <p className="text-sm text-white font-ui">3 pools</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Clock className="size-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Renewal</p>
                    <p className="text-sm text-white font-ui">N/A</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 opacity-75">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="size-6 text-white/70" />
                <h2 className="text-xl font-brand text-white">Notifications</h2>
              </div>
              <p className="text-white/50 font-ui mb-4">
                Email alerts for RangeBand™ status changes are available on Premium and Pro plans.
              </p>
              <Button variant="ghost" disabled className="border-white/10 text-white/40">
                Configure Alerts (Locked)
              </Button>
            </div>
          </div>
        </div>

        <Footer />
      </WaveBackground>
    </div>
  );
}





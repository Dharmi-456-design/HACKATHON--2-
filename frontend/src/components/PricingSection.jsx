import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Shield, Compass, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function PricingSection() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const handleSelectPlan = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  const PLANS = [
    {
      id: 'free',
      name: 'Explorer Tier',
      tagline: '100% Free Forever for All Observers',
      priceMonthly: '$0',
      priceYearly: '$0',
      period: 'forever',
      badge: 'Beginner Friendly',
      popular: false,
      features: [
        'Daily field observation logging',
        'Basic species identification',
        'Access to community biodiversity map',
        '5D nature connection telemetry tracking',
        'Standard PWA mobile app support',
      ],
      cta: 'Start Observing Free',
    },
    {
      id: 'pro',
      name: 'Habitat Pro',
      tagline: 'For Active Naturalists & Explorers',
      priceMonthly: '$4.99',
      priceYearly: '$3.99',
      period: 'per month',
      badge: 'Most Popular',
      popular: true,
      features: [
        'Unlimited Pulse AI species & call identification',
        'Acoustic dawn chorus telemetry logging',
        'High-resolution offline field maps',
        'Export field notes (PDF, CSV, GeoJSON)',
        'Priority AI model response latency (<500ms)',
        'Verified Community Explorer badge',
      ],
      cta: 'Begin 14-Day Free Trial',
    },
    {
      id: 'yearly',
      name: 'Sanctuary Team',
      tagline: 'For Habitats, Schools & Research Groups',
      priceMonthly: '$39',
      priceYearly: '$39',
      period: 'per year',
      badge: 'Best Value (Save 35%)',
      popular: false,
      features: [
        'Everything in Habitat Pro for up to 10 members',
        'Custom habitat telemetry dashboard',
        'Dedicated API keys for research data exports',
        'Seasonal ecological consultation reports',
        'Direct 24/7 priority support',
      ],
      cta: 'Join Sanctuary Team',
    },
  ];

  return (
    <section id="pricing" className={`py-24 border-t relative overflow-hidden select-none transition-colors duration-300 ${
      isDark ? 'bg-[#0A1610] text-white border-white/10' : 'bg-[#FAF7F0] text-[#0F2418] border-[#E3DDD1]'
    }`}>
      {/* Background glow radial accents */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none ${
        isDark ? 'bg-[#96CD7B]/10' : 'bg-[#96CD7B]/10'
      }`} />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-widest ${
            isDark ? 'bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B]' : 'bg-[#E1EFE0] border border-[#C3DEC0] text-[#183B28]'
          }`}>
            <Sparkles size={14} /> HACKATHON PRICING &amp; PLANS
          </div>

          <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-[#0F2418]'
          }`}>
            Budget-friendly plans for every explorer
          </h2>

          <p className={`text-base sm:text-lg font-light max-w-xl mx-auto ${
            isDark ? 'text-white/70' : 'text-[#3E5C48]'
          }`}>
            Choose a plan that fits your nature journey — from free daily field logs to full team habitat telemetry.
          </p>

          {/* Billing Cycle Toggle Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${billingCycle === 'monthly' ? (isDark ? 'text-white font-semibold' : 'text-[#0F2418] font-semibold') : (isDark ? 'text-white/50' : 'text-[#3E5C48]')}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`w-14 h-8 rounded-full border p-1 flex items-center transition-colors cursor-pointer ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-[#EDE6D8] border-[#D4CBB8]'
              }`}
            >
              <motion.div
                animate={{ x: billingCycle === 'yearly' ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-[#96CD7B] shadow-md"
              />
            </button>
            <span className={`text-xs font-medium ${billingCycle === 'yearly' ? (isDark ? 'text-white font-semibold' : 'text-[#0F2418] font-semibold') : (isDark ? 'text-white/50' : 'text-[#3E5C48]')}`}>
              Yearly Billing <span className="text-[#96CD7B] text-[10px] uppercase font-mono font-bold">(Save 35%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#1C3727] via-[#14281C] to-[#0E1E15] border-2 border-[#96CD7B] shadow-[0_20px_50px_rgba(150,205,123,0.18)] text-white'
                    : isDark
                      ? 'bg-white/5 border border-white/15 hover:border-white/30 text-white'
                      : 'bg-[#FDFBF7] border border-[#E3DDD1] hover:border-[#183B28]/50 text-[#0F2418] shadow-sm'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#96CD7B] text-[#0A1610] text-[11px] font-bold font-mono uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-display text-2xl font-bold ${plan.popular || isDark ? 'text-white' : 'text-[#0F2418]'}`}>{plan.name}</h3>
                    {!plan.popular && (
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-white/70' : 'bg-[#E1EFE0] text-[#183B28]'
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-light mb-6 ${plan.popular || isDark ? 'text-white/60' : 'text-[#3E5C48]'}`}>{plan.tagline}</p>

                  {/* Price */}
                  <div className={`flex items-baseline gap-1.5 mb-8 pb-6 border-b ${
                    plan.popular || isDark ? 'border-white/10' : 'border-[#E3DDD1]'
                  }`}>
                    <span className={`font-display text-4xl sm:text-5xl font-extrabold ${plan.popular || isDark ? 'text-white' : 'text-[#0F2418]'}`}>{price}</span>
                    <span className={`text-xs font-mono ${plan.popular || isDark ? 'text-white/60' : 'text-[#3E5C48]'}`}>/ {plan.period}</span>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className={`flex items-start gap-3 text-xs sm:text-sm font-light ${
                        plan.popular || isDark ? 'text-white/85' : 'text-[#2D4536]'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.popular || isDark ? 'bg-[#96CD7B]/20 text-[#96CD7B]' : 'bg-[#183B28] text-white'
                        }`}>
                          <Check size={12} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleSelectPlan}
                  className={`w-full py-3.5 px-6 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-md ${
                    plan.popular
                      ? 'bg-[#96CD7B] hover:bg-white text-[#0A1610] hover:scale-[1.02]'
                      : isDark
                        ? 'bg-white/10 hover:bg-white text-white hover:text-black'
                        : 'bg-[#183B28] hover:bg-[#255239] text-[#FAF7F0] hover:scale-[1.02]'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

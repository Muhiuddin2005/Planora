"use client";

import { Calendar, Shield, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          About Planora
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Simplifying Events, <span className="text-indigo-600">Connecting People.</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Planora is a premium event discovery and management platform designed to make event coordination seamless and secure. Whether you're hosting a private masterclass or coordinating a public developer bootcamp, we provide the tools to publish, discover, and join events.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Seamless Planning</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Create public or private events, set ticket prices, and schedule dates in just a few clicks. Manage your guest list effortlessly.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Secure Admissions</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Control who gains entry. Private events require organizer approval, and paid events feature direct, secure ticket checkout.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Community Driven</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Read and write reviews, check other participants' suggestions, and share experiences on our interactive, modern portal.
          </p>
        </div>
      </section>

      {/* Dynamic Action Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Discover Your Next Experience?
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Browse through hundreds of events, secure your tickets, or create your own community gathering in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/events" passHref>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-8">
                Explore Events
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold px-8 bg-transparent">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </section>
    </div>
  );
}

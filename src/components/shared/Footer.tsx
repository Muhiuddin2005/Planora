import Link from "next/link";
import { Calendar } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-500">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <span>Planora<span className="text-indigo-600">.</span></span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed text-slate-500">
              Planora is a premium JWT-protected Event Management and Discovery platform. 
              Scaffolded with Next.js, Stripe, and PostgreSQL for robust operations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-900 mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
              <li><Link href="/events" className="hover:text-indigo-600 transition-colors">Public Events</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Dhaka, Bangladesh</li>
              <li>support@planora.com</li>
              <li>+880 1234-567890</li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-200 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Planora Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

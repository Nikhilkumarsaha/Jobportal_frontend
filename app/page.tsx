import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Build your best job community starting here.
        </h1>
        <p className="mt-5 text-xl text-gray-800 leading-relaxed">
          Connect with top employers and discover opportunities that match your skills and aspirations.
        </p>
        <div className="mt-10">
          <Link
            href="/auth/login"
            className="px-7 py-3 bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-800 transition-all duration-300"
          >
            Sign in →
          </Link>
        </div>
      </div>
    </main>
  );
}

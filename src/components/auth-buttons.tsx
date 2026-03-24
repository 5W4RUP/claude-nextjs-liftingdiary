'use client';

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function AuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
      <SignUpButton mode="modal">
        <button className="relative group px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-white text-sm sm:text-base overflow-hidden transition-all duration-300 cursor-pointer">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300" />

          {/* Animated border */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Content */}
          <span className="relative flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
            🚀 Start Training
          </span>
        </button>
      </SignUpButton>

      <SignInButton mode="modal">
        <button className="relative group px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-white text-sm sm:text-base border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 cursor-pointer">
          {/* Hover background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

          {/* Content */}
          <span className="relative flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
            🔓 Sign In
          </span>
        </button>
      </SignInButton>

      <div className="hidden sm:block border-l border-purple-400/30 h-8" />

      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10 rounded-full border-2 border-purple-400/50 hover:border-purple-400 transition-colors"
          }
        }}
      />
    </div>
  );
}

import Link from "next/link";
import { BoltIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl">Trade Boldly with dOTC</h1>
        <p className="mt-3 text-xl md:text-2xl lg:text-3xl max-w-md mx-auto">
          Experience the pinnacle of OTC trading for Web3 assets.
        </p>
        <div className="my-6">
          <BoltIcon className="w-16 h-16 animate-pulse mx-auto text-yellow-300" />
        </div>
        <Link
          href="/trade"
          className="mt-2 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition duration-300"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

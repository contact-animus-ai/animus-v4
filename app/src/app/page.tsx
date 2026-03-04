import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          Your AI Marketing Operator.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-400 leading-relaxed">
          Animus audits your Klaviyo, identifies revenue opportunities, creates
          segments, and generates on-brand emails — automatically.
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-block bg-white text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-200 transition-colors"
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </div>
  );
}

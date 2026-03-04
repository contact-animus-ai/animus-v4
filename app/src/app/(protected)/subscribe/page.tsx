export default function SubscribePage() {
  return (
    <div className="max-w-md mx-auto p-8 flex items-center justify-center min-h-screen">
      <div className="bg-[#111] rounded-xl p-8 w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Animus Pro</h1>
        <p className="text-4xl font-bold text-white mb-1">$99<span className="text-lg text-gray-400">/month</span></p>
        <p className="text-gray-400 text-sm mb-8">Everything you need to automate email marketing.</p>

        <ul className="text-left text-sm text-gray-300 space-y-3 mb-8">
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 14-point Klaviyo audit</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Automated segment creation</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> AI email generation</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Visual email editor</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Direct Klaviyo push</li>
          <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Competitive research</li>
        </ul>

        <button className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors">
          Subscribe Now
        </button>
        <p className="text-xs text-gray-500 mt-3">Stripe integration coming in Phase 10</p>
      </div>
    </div>
  );
}

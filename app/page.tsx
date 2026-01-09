export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center border-b border-gray-200">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DARX
        </div>
        <div className="flex gap-4">
          <a
            href="https://darx-signup-page.vercel.app/"
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Sign Up
          </a>
          <a
            href="https://darx-site-generator-slgtfcnoxq-uc.a.run.app/onboard/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-600/30"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-4xl text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Digital Architecture
            <br />
            Experience
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            AI-powered website generation platform that transforms your ideas into beautiful, functional websites in minutes.
          </p>
          <div className="flex gap-6 justify-center">
            <a
              href="https://darx-signup-page.vercel.app/"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
            >
              Get Started
            </a>
            <a
              href="https://darx-site-generator-slgtfcnoxq-uc.a.run.app/onboard/login"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-gray-400 hover:scale-105 transition-all"
            >
              Login to Dashboard
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-8 border-t border-gray-200 text-center text-gray-600">
        <p>&copy; 2026 Digital Architex. All rights reserved.</p>
      </footer>
    </div>
  );
}

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand with Logo */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
              <div className="w-10 h-10">
                <img 
                  src="/images/products/logo.jpg"
                  alt="NetApps Development"
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Net<span className="text-green-400">Apps</span>
                </h3>
                <p className="text-xs text-gray-400">EST. 2018</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              A Better Digital Experience
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-white mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">Orders</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-white mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-white mb-3 sm:mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 info@netappsdevelopment.com</li>
              <li>📞 071 175 3994</li>
              <li>📍 125 Florence Nzama St, Durban</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm text-gray-500">
          &copy; {year} NetApps Development. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
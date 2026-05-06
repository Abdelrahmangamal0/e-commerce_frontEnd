export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SOUQ OKAZ</h3>
            <p className="text-gray-400 text-sm">
              Your trusted online shopping destination
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/products" className="hover:text-white">
                  Products
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/shipping" className="hover:text-white">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="/returns" className="hover:text-white">
                  Returns
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://www.facebook.com/share/18Z8n9Zsx3/" className="hover:text-white">
                 
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@karim.gamal12?_r=1&_t=ZS-968NPoSnI8b" className="hover:text-white">
                  TikTok
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/cookiecookies1998?igsh=N283aWFkc2Y5YWZ4" className="hover:text-white">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://wa.me/qr/RRNZWVIPEGPSN1" className="hover:text-white">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} SOUQ OKAZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

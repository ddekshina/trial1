const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 sm:py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm">
              © {new Date().getFullYear()} Pricing Analyst Tool. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <a href="/" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="/" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors">
              Terms of Service
            </a>
            <a href="/" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
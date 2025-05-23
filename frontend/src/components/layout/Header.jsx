const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto py-3 sm:py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-bold text-blue-800">
            Pricing Analyst Portal
          </h1>
        </div>
        <nav className="w-full sm:w-auto">
          <div className="text-xs sm:text-sm text-gray-500 text-left sm:text-right">
            Pricing Analysis Tool
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
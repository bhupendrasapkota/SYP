// Navbar.jsx
import { Link } from "react-router-dom";
import UserSection from "./components/UserSection";
import SearchIcon from "./components/Search/SearchIcon";

const Navbar = () => {
  const navLinks = [
    { to: "/Explore", label: "Explore" },
    { to: "/trending", label: "Trending" },
    { to: "/collection", label: "Collection" },
    { to: "/users", label: "Users" },
  ];

  const renderNavLinks = () =>
    navLinks.map((link) => (
      <li key={link.label}>
        <Link
          to={link.to}
          className="no-underline text-black hover:text-zinc-500 transition-colors duration-300 text-sm md:text-base lg:text-lg"
          aria-label={link.label}
        >
          {link.label}
        </Link>
      </li>
    ));

  return (
    <section className="relative">
      <div className="fixed top-0 w-full bg-white border-b border-black z-50 h-16 md:h-20">
        <div className="flex items-center justify-between h-full w-full px-2">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="Home" className="flex items-center">
              <img
                src="/images/Logo/Logo.svg"
                alt="Logo"
                className="h-8 md:h-10 w-auto object-contain bg-transparent"
              />
            </Link>
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6 font-mono uppercase">
                {renderNavLinks()}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <UserSection />
          </div>
        </div>
      </div>

      <div className="fixed right-2 top-20 md:top-24 z-40">
        <SearchIcon />
      </div>
    </section>
  );
};

export default Navbar;

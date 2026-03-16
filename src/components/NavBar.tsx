import { BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Sobre Mim", path: "/sobre" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
          <span className="font-display text-lg font-bold text-foreground">
            Between the Pages
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

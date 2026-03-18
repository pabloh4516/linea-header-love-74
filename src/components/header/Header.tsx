import { useSiteSettings } from "@/hooks/useSiteSettings";
import StatusBar from "./StatusBar";
import Navigation from "./Navigation";

const Header = () => {
  const { data: settings } = useSiteSettings();
  const isSticky = settings?.theme_nav_sticky !== "false";

  return (
    <header className={`w-full ${isSticky ? "sticky top-0" : "relative"} z-50`}>
      <StatusBar />
      <Navigation />
    </header>
  );
};

export default Header;

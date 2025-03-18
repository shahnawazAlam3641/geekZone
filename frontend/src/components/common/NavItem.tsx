import { NavLink } from "react-router";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, onClick }: NavItemProps) => {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? "text-white bg-primary"
              : "text-gray-400 hover:text-white hover:bg-background"
          }`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default NavItem;

import type { ReactNode } from "react";
import { NavLink } from "react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronsLeft, FolderGit2, UserRound, X } from "lucide-react";
import { categoryIcons } from "src/utils/categoryIcons";
import { activeProjects, archiveCategoriesInUse } from "src/data/projects";
import { ThemeToggle } from "src/components/ThemeToggle/ThemeToggle";
import styles from "src/components/Sidebar/Sidebar.module.css";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavItemProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  onNavigate: () => void;
  end?: boolean;
};

function NavItem({
  to,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
  end,
}: NavItemProps) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.active}` : styles.link
        }
      >
        <Icon className={styles.icon} size={20} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
      </NavLink>
    </li>
  );
}

type NavGroupProps = {
  id: string;
  title: string;
  isEmpty: boolean;
  children: ReactNode;
};

// A titled section of the sidebar, separated from the one above by a line.
function NavGroup({ id, title, isEmpty, children }: NavGroupProps) {
  return (
    <div className={styles.group}>
      <h2 className={styles.groupTitle} id={id}>
        {title}
      </h2>
      {isEmpty ? (
        <p className={styles.empty}>None right now</p>
      ) : (
        <ul className={styles.list} aria-labelledby={id}>
          {children}
        </ul>
      )}
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const classes = [
    styles.sidebar,
    collapsed && styles.collapsed,
    mobileOpen && styles.mobileOpen,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside id="sidebar" className={classes}>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.closeMobile}`}
        onClick={onCloseMobile}
        aria-label="Close menu"
      >
        <X size={22} aria-hidden="true" />
      </button>

      <nav className={styles.nav} aria-label="Main">
        <ul className={styles.list}>
          <NavItem
            to="/"
            end
            label="Introduction"
            icon={UserRound}
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />
        </ul>

        <NavGroup
          id="active-projects-title"
          title="Active projects"
          isEmpty={activeProjects.length === 0}
        >
          {activeProjects.map((project) => (
            <NavItem
              key={project.id}
              to={`/projects/${project.id}`}
              label={project.title}
              icon={FolderGit2}
              collapsed={collapsed}
              onNavigate={onCloseMobile}
            />
          ))}
        </NavGroup>

        <NavGroup
          id="archived-projects-title"
          title="Archived projects"
          isEmpty={archiveCategoriesInUse.length === 0}
        >
          {archiveCategoriesInUse.map((category) => (
            <NavItem
              key={category.id}
              to={`/archived/${category.id}`}
              label={category.title}
              icon={categoryIcons[category.id]}
              collapsed={collapsed}
              onNavigate={onCloseMobile}
            />
          ))}
        </NavGroup>
      </nav>

      <div className={styles.footer}>
        <ThemeToggle className={styles.iconButton} />
        <button
          type="button"
          className={`${styles.iconButton} ${styles.collapseButton}`}
          onClick={onToggleCollapsed}
          aria-controls="sidebar"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft size={20} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

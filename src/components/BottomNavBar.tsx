import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',              icon: 'dashboard',    label: 'ראשי'     },
  { to: '/transactions',  icon: 'receipt_long', label: 'עסקאות'   },
  { to: '/users',         icon: 'group',        label: 'משתמשים'  },
  { to: '/summary',       icon: 'summarize',    label: 'סיכום'    },
  { to: '/add',           icon: 'add_circle',   label: 'הוספה'    },
];

export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-low/90 backdrop-blur-xl flex justify-around items-center px-4 pb-6 pt-2 rtl rounded-t-2xl border-t border-surface-container-highest shadow-[0_-4px_20px_rgba(0,25,60,0.08)]">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-secondary-container text-primary scale-110'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[11px] font-bold mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

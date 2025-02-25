import Calculator from 'lucide-svelte/icons/calculator';
import ClipboardList from 'lucide-svelte/icons/clipboard-list';
import CreditCard from 'lucide-svelte/icons/credit-card';
import Hammer from 'lucide-svelte/icons/hammer';
import Users from 'lucide-svelte/icons/users';
import LayoutDashboard from 'lucide-svelte/icons/layout-dashboard';
import Cog from 'lucide-svelte/icons/cog';
import ShoppingBasket from 'lucide-svelte/icons/shopping-basket';
import chartLine from 'lucide-svelte/icons/chart-line';

export const navData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
      items: [
        // {
        // 	title: 'History',
        // 	url: '#'
        // }
      ]
    },
    {
      title: 'Customers',
      url: '/customers',
      icon: Users,
      items: [
        {
          title: 'Create',
          url: '/customers/create'
        }
      ]
    },
    {
      title: 'Products',
      url: '/products',
      icon: ShoppingBasket,
      items: [
        {
          title: 'Upload Products',
          url: '/products/upload'
        },
        {
          title: 'Create',
          url: '/products/create'
        }
      ]
    },
    {
      title: 'Billings',
      url: '/billings',
      icon: CreditCard,
      items: [
        {
          title: 'Orders',
          url: '/billings/orders'
        },
        {
          title: 'Sales Book',
          url: '/billings/sales'
        }
      ]
    },
    {
      title: 'Payments',
      url: '/payments',
      icon: Calculator,
      items: [
        // {
        //   title: 'Get Started',
        //   url: '#'
        // }
      ]
    },
    {
      title: 'Production',
      url: '/production',
      icon: Hammer,
      items: [
        // {
        //   title: 'Get Started',
        //   url: '#'
        // }
      ]
    },
    {
      title: 'Expenses',
      url: '/expenses',
      icon: chartLine,
      items: [
        // {
        //   title: 'Get Started',
        //   url: '#'
        // }
      ]
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: ClipboardList,
      items: [
        // {
        //   title: 'Get Started',
        //   url: '#'
        // }
      ]
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Cog,
      items: [
        {
          title: 'Company Setup',
          url: '/settings/company'
        },
        {
          title: 'Cash Register',
          url: '/settings/register'
        },
        {
          title: 'Pricing Tiers',
          url: '/settings/pricing'
        },
        {
          title: 'Currencies',
          url: '/settings/currencies'
        }
      ]
    }
  ]
};

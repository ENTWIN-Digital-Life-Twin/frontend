import {
  LucideApple,
  LucideBell,
  LucideBot,
  LucideCalendar,
  LucideCalendarDays,
  LucideDumbbell,
  LucideHeartPulse,
  LucideLayoutDashboard,
  LucideListTodo,
  LucideSettings,
  LucideShield,
  LucideUser,
  type LucideIcon,
} from '@lucide/angular';

export interface NavItem {
  labelKey: string;
  path: string;
  icon: LucideIcon;
  descriptionKey: string;
}

export interface NavSection {
  labelKey: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    labelKey: 'sidebar.sections.navigation',
    items: [
      {
        labelKey: 'sidebar.nav.dashboard',
        path: '/dashboard',
        icon: LucideLayoutDashboard,
        descriptionKey: 'sidebar.descriptions.dashboard',
      },
      {
        labelKey: 'sidebar.nav.planning',
        path: '/planning',
        icon: LucideCalendarDays,
        descriptionKey: 'sidebar.descriptions.planning',
      },
      {
        labelKey: 'sidebar.nav.tasks',
        path: '/tasks',
        icon: LucideListTodo,
        descriptionKey: 'sidebar.descriptions.tasks',
      },
      {
        labelKey: 'sidebar.nav.calendar',
        path: '/calendar',
        icon: LucideCalendar,
        descriptionKey: 'sidebar.descriptions.calendar',
      },
    ],
  },
  {
    labelKey: 'sidebar.sections.wellbeing',
    items: [
      {
        labelKey: 'sidebar.wellbeing.title',
        path: '/wellness',
        icon: LucideHeartPulse,
        descriptionKey: 'sidebar.descriptions.wellness',
      },
      {
        labelKey: 'sidebar.nutrition.title',
        path: '/nutrition',
        icon: LucideApple,
        descriptionKey: 'sidebar.descriptions.nutrition',
      },
      {
        labelKey: 'sidebar.sport.title',
        path: '/sport',
        icon: LucideDumbbell,
        descriptionKey: 'sidebar.descriptions.sport',
      },
    ],
  },
  {
    labelKey: 'sidebar.sections.intelligence',
    items: [
      {
        labelKey: 'sidebar.ai.title',
        path: '/assistant',
        icon: LucideBot,
        descriptionKey: 'sidebar.descriptions.assistant',
      },
      {
        labelKey: 'sidebar.notifications.title',
        path: '/notifications',
        icon: LucideBell,
        descriptionKey: 'sidebar.descriptions.notifications',
      },
    ],
  },
];

export const ACCOUNT_ITEMS: NavItem[] = [
  {
    labelKey: 'sidebar.account.profile',
    path: '/profile',
    icon: LucideUser,
    descriptionKey: 'sidebar.descriptions.profile',
  },
  {
    labelKey: 'sidebar.settings.title',
    path: '/settings',
    icon: LucideSettings,
    descriptionKey: 'sidebar.descriptions.settings',
  },
];

export const ADMIN_ITEM: NavItem = {
  labelKey: 'sidebar.admin.title',
  path: '/admin',
  icon: LucideShield,
  descriptionKey: 'sidebar.descriptions.admin',
};

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_SECTIONS.flatMap((section) => section.items),
  ...ACCOUNT_ITEMS,
  ADMIN_ITEM,
];

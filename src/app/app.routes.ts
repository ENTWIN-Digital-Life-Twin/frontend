import { Routes } from '@angular/router';
import { SeoConfig } from './core/services/seo/seo.service';
import { authGuard, profileCompleteGuard, skipOnboardingIfCompleteGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export function seo(config: SeoConfig): { seo: SeoConfig } {
  return { seo: config };
}

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    data: { ...seo({
      title: 'Connexion — Digital Life Twin',
      description:
        'Connectez-vous à votre espace Digital Life Twin pour retrouver votre planning, votre bien-être et vos insights personnalisés.',
    }), preload: false },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
    data: { ...seo({
      title: 'Mot de passe oublié — Digital Life Twin',
      description: 'Réinitialisez le mot de passe de votre compte Digital Life Twin.',
    }), preload: false },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
    data: { ...seo({
      title: 'Nouveau mot de passe — Digital Life Twin',
      description: 'Choisissez un nouveau mot de passe pour votre compte Digital Life Twin.',
    }), preload: false },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    data: { ...seo({
      title: 'Créer un compte — Digital Life Twin',
      description:
        'Créez votre compte gratuit et centralisez votre planning, vos habitudes et votre bien-être au même endroit.',
    }), preload: false },
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/auth/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
    canActivate: [authGuard, skipOnboardingIfCompleteGuard],
    data: { ...seo({
      title: 'Complete your profile — Digital Life Twin',
      description: 'Add sex, height, weight and wellness goals to personalize Digital Life Twin.',
      robots: 'noindex, nofollow',
    }), preload: false },
  },
  {
    path: '',
    loadComponent: () => import('./features/public/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/pages/home/home').then((m) => m.HomeComponent),
        data: seo({
          title: 'Digital Life Twin — Votre quotidien, enfin compris',
          description:
            'Digital Life Twin centralise votre planning, vos habitudes et votre bien-être pour vous aider à mieux organiser votre quotidien.',
        }),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/pages/about/about').then((m) => m.AboutComponent),
        data: seo({
          title: 'À propos — Digital Life Twin',
          description:
            'Découvrez la vision de Digital Life Twin : une plateforme au service de votre organisation et de votre bien-être.',
        }),
      },
      {
        path: 'features',
        loadComponent: () =>
          import('./features/public/pages/features/features').then((m) => m.FeaturesComponent),
        data: seo({
          title: 'Fonctionnalités — Digital Life Twin',
          description:
            'Planning, tâches, calendrier, bien-être, nutrition, sport, notifications et IA : découvrez toutes les fonctionnalités de Digital Life Twin.',
        }),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/pages/contact/contact').then((m) => m.ContactComponent),
        data: seo({
          title: 'Contact — Digital Life Twin',
          description:
            'Une question, une idée, un retour ? Contactez l\'équipe Digital Life Twin. Temps de réponse moyen : moins de 24 h.',
        }),
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/public/pages/legal/legal-page').then((m) => m.LegalPageComponent),
        data: {
          kind: 'terms',
          ...seo({
            title: 'Terms of use — Digital Life Twin',
            description: 'Terms of use for the Digital Life Twin platform.',
          }),
        },
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/public/pages/legal/legal-page').then((m) => m.LegalPageComponent),
        data: {
          kind: 'privacy',
          ...seo({
            title: 'Privacy policy — Digital Life Twin',
            description: 'How Digital Life Twin collects, uses and protects your personal data.',
          }),
        },
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/app-shell/app-shell').then((m) => m.AppShell),
    canActivate: [authGuard, profileCompleteGuard],
    data: { ...seo({
      title: 'Digital Life Twin',
      robots: 'noindex, nofollow',
    }), preload: false },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { preload: false },
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./features/planning/planning').then((m) => m.PlanningComponent),
        data: { preload: false },
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/tasks').then((m) => m.TasksComponent),
        data: { preload: false },
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar').then((m) => m.CalendarComponent),
        data: { preload: false },
      },
      {
        path: 'wellness',
        loadComponent: () =>
          import('./features/wellness/wellness').then((m) => m.WellnessComponent),
        data: { preload: false },
      },
      {
        path: 'nutrition',
        loadComponent: () =>
          import('./features/nutrition/nutrition').then((m) => m.NutritionComponent),
        data: { preload: false },
      },
      {
        path: 'sport',
        loadComponent: () => import('./features/sport/sport').then((m) => m.SportComponent),
        data: { preload: false },
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications').then((m) => m.NotificationsComponent),
        data: { preload: false },
      },
      {
        path: 'ai',
        loadComponent: () => import('./features/ai/ai').then((m) => m.AiComponent),
        data: { preload: false },
      },
      {
        path: 'assistant',
        loadComponent: () =>
          import('./features/assistant/assistant').then((m) => m.AssistantComponent),
        data: { preload: false },
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
        data: { preload: false },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings').then((m) => m.SettingsComponent),
        data: { ...seo({
          title: 'Paramètres — Digital Life Twin',
          description:
            'Personnalisez votre compte, votre expérience et vos préférences sur Digital Life Twin.',
        }), preload: false },
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin').then((m) => m.AdminComponent),
        canActivate: [adminGuard],
        data: { preload: false },
      },
    ],
  },
  { path: '**', redirectTo: '/' },
];

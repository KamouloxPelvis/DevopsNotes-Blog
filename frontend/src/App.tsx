import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ToastProvider } from './context/ToastContext';
import { PageLayout } from './components/PageLayout';
import { RequireAuthRoute } from './components/RequireAuthRoute';
import { RequireAdminRoute } from './components/RequireAdminRoute';
import './App.css';

// --- Chargement IMMÉDIAT (uniquement la page d'accueil) ---
import HomePage from './pages/HomePage';

// --- Chargement DIFFÉRÉ (Lazy Loading) ---
// On déplace tous les autres imports ici pour réduire le bundle initial
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Signin = lazy(() => import('./pages/SigninPage'));
const Signup = lazy(() => import('./pages/SignupPage'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const NewThreadPage = lazy(() => import('./pages/NewThreadPage'));
const EditThreadPage = lazy(() => import('./pages/EditThreadPage'));
const ThreadDetailPage = lazy(() => import('./pages/ThreadDetailPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ArticlesList = lazy(() => import('./pages/ArticlesPage').then(module => ({ default: module.ArticlesList })));
const ArticleDetail = lazy(() => import('./pages/ArticleDetailPage'));
const NewArticle = lazy(() => import('./pages/NewArticlePage'));
const EditArticle = lazy(() => import('./pages/EditArticlePage'));

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PageLayout>
          {/* Le Suspense affiche un fallback léger pendant que le chunk de la page charge */}
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/homepage" replace />} />
              <Route path="/homepage" element={<HomePage />} />
              
              {/* Articles */}
              <Route path="/articles" element={<ArticlesList />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route 
                path="/articles/new" 
                element={<RequireAdminRoute><NewArticle /></RequireAdminRoute>} 
              />
              <Route 
                path="/articles/:slug/edit" 
                element={<RequireAdminRoute><EditArticle /></RequireAdminRoute>} 
              />

              {/* Auth */}
              <Route path="/login" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route 
                path="/profile" 
                element={<RequireAuthRoute><ProfilePage /></RequireAuthRoute>} 
              />

              {/* Forum */}
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:id" element={<ThreadDetailPage />} />
              <Route 
                path="/forum/new" 
                element={<RequireAuthRoute><NewThreadPage /></RequireAuthRoute>} 
              />
              <Route 
                path="/forum/:id/edit" 
                element={<RequireAuthRoute><EditThreadPage /></RequireAuthRoute>} 
              />

              {/* Chat */}
              <Route 
                path="/chat" 
                element={<RequireAuthRoute><ChatPage /></RequireAuthRoute>} 
              />
            </Routes>
          </Suspense>
        </PageLayout>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
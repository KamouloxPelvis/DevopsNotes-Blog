import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ToastProvider } from './context/ToastContext';
import { PageLayout } from './components/PageLayout';
import { RequireAuthRoute } from './components/RequireAuthRoute';
import { RequireAdminRoute } from './components/RequireAdminRoute';
import './App.css';


//Pages
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import Signin  from './pages/SigninPage';
import Signup from './pages/SignupPage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ForumPage from './pages/forum/ForumPage';
import NewThreadPage from './pages/forum/NewThreadPage';
import EditThreadPage from './pages/forum/EditThreadPage';
import ThreadDetailPage from './pages/forum/ThreadDetailPage';
import ChatPage from './pages/ChatPage';
import { ArticlesList } from './pages/articles/ArticlesPage';
import ArticleDetail from './pages/articles/ArticleDetailPage';
const NewArticle = lazy(() => import ('./pages/articles/NewArticlePage'));
const EditArticle = lazy(() => import ('./pages/articles/EditArticlePage'));

// CSS

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PageLayout>
          <Suspense fallback={<div className="loading">Chargement de l'éditeur...</div>}>
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
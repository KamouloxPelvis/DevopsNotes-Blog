// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { PageLayout } from './components/PageLayout';
import { RequireAuthRoute } from './components/RequireAuthRoute';

// Pages imports
import HomePage from './pages/HomePage';
import Signin  from './pages/SigninPage';
import Signup from './pages/SignupPage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ArticlesList } from './pages/articles/ArticlesPage';
import ArticleDetail from './pages/articles/ArticleDetailPage';
import EditArticle from './pages/articles/EditArticlePage';
import NewArticle from './pages/articles/NewArticlePage';
import ForumPage from './pages/forum/ForumPage';
import NewThreadPage from './pages/forum/NewThreadPage';
import EditThreadPage from './pages/forum/EditThreadPage';
import ThreadDetailPage from './pages/forum/ThreadDetailPage';
import ChatPage from './pages/ChatPage';

// CSS Global (Variables, Reset, Boutons communs)
import './App.css';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PageLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" replace />} />
            <Route path="/homepage" element={<HomePage />} />
            
            {/* Articles */}
            <Route path="/articles" element={<ArticlesList />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route 
              path="/articles/new" 
              element={<RequireAuthRoute><NewArticle /></RequireAuthRoute>} 
            />
            <Route 
              path="/articles/:slug/edit" 
              element={<RequireAuthRoute><EditArticle /></RequireAuthRoute>} 
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
        </PageLayout>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
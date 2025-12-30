import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { RequireAuthRoute } from './components/RequireAuthRoute';
import { PageLayout } from './components/PageLayout';
import { ToastProvider } from './context/ToastContext';
import { LoginPage } from './pages/SigninPage';
import { ArticlesList } from './pages/articles/ArticlesPage';
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage';
import ArticleDetail from './pages/articles/ArticleDetailPage';
import EditArticle from './pages/articles/EditArticlePage';
import NewArticle from './pages/articles/NewArticlePage';
import ForumPage from './pages/forum/ForumPage';
import NewThreadPage from './pages/forum/NewThreadPage';
import EditThreadPage from './pages/forum/EditThreadPage';
import ThreadDetailPage from './pages/forum/ThreadDetailPage';
import ChatPage from './pages/ChatPage';
import devopsLogo from './devopsnotes_logo.png';
import devopsFav from './devopsnotes_ico.jpg';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <>
          <Link to="/homepage" className="global-logo">
            <img src={devopsFav} alt="DevOpsNotes" className="global-logo img" />
          </Link>

          <PageLayout>
            <div className="app">
              <header className="app-header logo-header">
              <img src={devopsLogo} alt="DevOpsNotes logo" className="app-logo-main" />
            </header>

              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Navigate to="/homepage" replace />} />
                  <Route path="/homepage" element={<HomePage />} />
                  <Route path="/articles" element={<ArticlesList />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route 
                    path="/articles/new" 
                    element={
                      <RequireAuthRoute>
                        <NewArticle />
                      </RequireAuthRoute> } />
                  <Route path="/articles/:slug" element={<ArticleDetail />} />
                  <Route 
                    path="/articles/:slug/edit" 
                    element={
                      <RequireAuthRoute> 
                        <EditArticle /> 
                      </RequireAuthRoute> } />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route 
                    path="/forum/new" 
                    element={ 
                      <RequireAuthRoute>
                        <NewThreadPage />
                      </RequireAuthRoute> } />
                  <Route path="/forum/:id" element={<ThreadDetailPage />} />
                  <Route 
                    path="/forum/:id/edit" 
                    element={ 
                  <RequireAuthRoute>
                    <EditThreadPage/>
                  </RequireAuthRoute> } />
                  <Route 
                    path="/chat" 
                    element={
                      <RequireAuthRoute>
                        <ChatPage />
                      </RequireAuthRoute>} />
                </Routes>
              </main>
            </div>
          </PageLayout>
        </> 
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
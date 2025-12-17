import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { ArticlesList } from './components/ArticlesList';
import ArticleDetail from './components/ArticleDetail';
import EditArticle from './components/EditArticle';
import NewArticle from './components/NewArticle';
import ForumPage from './components/ForumPage';
import NewThreadPage from './components/NewThreadPage';
import ThreadDetailPage from './components/ThreadDetailPage';
import devopsLogo from './devopsnotes_logo.png';
import devopsFav from './devopsnotes_ico.jpg';

function App() {
  return (
    <BrowserRouter>
      <>
        <Link to="/" className="global-logo">
          <img src={devopsFav} alt="DevOpsNotes" className="global-logo img" />
        </Link>
        <div className="app">
          <header className="app-header">
            <img src={devopsLogo} alt="DevOpsNotes logo" className="app-logo-main" />
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<ArticlesList />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/articles/new" element={<NewArticle />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/articles/:slug/edit" element={<EditArticle />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/new" element={<NewThreadPage />} />
              <Route path="/forum/:id" element={<ThreadDetailPage />} />
            </Routes>
          </main>
        </div>
      </>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import ArticleDetail from './components/ArticleDetail';
import NewArticle from './components/NewArticle';
import EditArticle from './components/EditArticle';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  { path: '/', element: <App /> },              // liste des articles
  { path: '/articles/new', element: <NewArticle /> },   // création de l'article
  { path: '/articles/:slug', element: <ArticleDetail /> }, // détail de l'article
  { path: '/articles/:slug/edit', element: <EditArticle /> }, // édition de l'article 
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();


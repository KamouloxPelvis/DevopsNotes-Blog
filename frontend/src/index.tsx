import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import ArticleDetail from './components/ArticleDetail';
import NewArticle from './components/NewArticle';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  { path: '/', element: <App /> },              // liste des articles
  { path: '/articles/new', element: <NewArticle /> },   // création
  { path: '/articles/:slug', element: <ArticleDetail /> } // détail
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


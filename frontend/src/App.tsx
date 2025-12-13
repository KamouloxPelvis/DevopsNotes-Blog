import React from 'react';
import logo from './devopsnotes_logo.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Bienvenue sur mon mini-blog consacré à l'art du DevOps
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          A l'essentiel !
        </a>
      </header>
    </div>
  );
}

export default App;

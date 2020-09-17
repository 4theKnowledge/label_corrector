import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="header">
        Navigation and save goes here
      </div>

      <div className="loader">
        Load data here (Dropzone from disk and button for processing)
      </div>

      <div className="pagination">
        Pagination goes here (page through set of documents)
      </div>

      <div className="document-set">
        Set of documents go here
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CodeEditor from './components/CodeEditor';
import Auth from './components/Auth';
import { LANGUAGES, getLanguageById } from './lib/languages';
import { supabase } from './lib/supabase';

function CompilerApp() {
  const { user, profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [snippetTitle, setSnippetTitle] = useState('Untitled');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [publicSnippets, setPublicSnippets] = useState([]);

  useEffect(() => {
    const language = getLanguageById(selectedLanguage);
    setCode(language.defaultCode);
  }, [selectedLanguage]);

  useEffect(() => {
    if (user) {
      loadSavedSnippets();
    }
  }, [user]);

  useEffect(() => {
    if (currentPage === 'gallery') {
      loadPublicSnippets();
    }
  }, [currentPage]);

  const loadSavedSnippets = async () => {
    const { data, error } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setSavedSnippets(data);
    }
  };

  const loadPublicSnippets = async () => {
    const { data, error } = await supabase
      .from('code_snippets')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setPublicSnippets(data);
    }
  };

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    setOutput('');
    setConsoleOutput([]);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setConsoleOutput([]);

    const language = getLanguageById(selectedLanguage);

    try {
      if (language.executionType === 'browser') {
        runBrowserCode(language);
      } else if (language.executionType === 'server') {
        await runServerCode(language);
      } else {
        setConsoleOutput([{ type: 'error', message: 'This language does not support execution yet' }]);
      }
    } catch (error) {
      setConsoleOutput([{ type: 'error', message: error.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runBrowserCode = (language) => {
    const iframe = document.getElementById('preview-iframe');

    if (language.id === 'javascript') {
      const logs = [];
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
      };

      const mockConsole = {
        log: (...args) => {
          logs.push({ type: 'log', message: args.join(' ') });
          originalConsole.log(...args);
        },
        error: (...args) => {
          logs.push({ type: 'error', message: args.join(' ') });
          originalConsole.error(...args);
        },
        warn: (...args) => {
          logs.push({ type: 'warn', message: args.join(' ') });
          originalConsole.warn(...args);
        }
      };

      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <style>body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }</style>
          </head>
          <body>
            <script>
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;

              console.log = function(...args) {
                window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
                originalLog.apply(console, args);
              };

              console.error = function(...args) {
                window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
                originalError.apply(console, args);
              };

              console.warn = function(...args) {
                window.parent.postMessage({ type: 'warn', message: args.join(' ') }, '*');
                originalWarn.apply(console, args);
              };

              try {
                ${code}
              } catch (error) {
                console.error(error.message);
              }
            </script>
          </body>
          </html>
        `);
        iframeDoc.close();
      } catch (error) {
        setConsoleOutput([{ type: 'error', message: error.message }]);
      }
    } else {
      const htmlCode = selectedLanguage === 'html' ? code : '<!DOCTYPE html><html><body></body></html>';
      const cssCode = selectedLanguage === 'css' ? code : '';
      const jsCode = selectedLanguage === 'javascript' ? code : '';

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
        </html>
      `);
      iframeDoc.close();
    }
  };

  const runServerCode = async () => {
    setConsoleOutput([{
      type: 'info',
      message: 'Server-side execution is not yet implemented. This will execute code securely via Edge Functions.'
    }]);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type) {
        setConsoleOutput(prev => [...prev, event.data]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const saveSnippet = async (isPublic = false) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .insert({
          user_id: user.id,
          title: snippetTitle,
          language: selectedLanguage,
          code: code,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      setConsoleOutput(prev => [...prev, {
        type: 'success',
        message: `Snippet saved successfully! ${isPublic ? '(Public)' : '(Private)'}`
      }]);

      loadSavedSnippets();
    } catch (error) {
      setConsoleOutput(prev => [...prev, { type: 'error', message: error.message }]);
    } finally {
      setIsSaving(false);
    }
  };

  const loadSnippet = (snippet) => {
    setSnippetTitle(snippet.title);
    setSelectedLanguage(snippet.language);
    setCode(snippet.code);
    setCurrentPage('compiler');
    setConsoleOutput([{ type: 'info', message: `Loaded: ${snippet.title}` }]);
  };

  const renderHome = () => (
    <div className="page-content">
      <div className="hero">
        <h1>TryAnyCode</h1>
        <p className="subtitle">Write, Run, and Share Code in 20+ Languages</p>
        <button className="cta-button" onClick={() => setCurrentPage('compiler')}>
          Start Coding
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Multi-Language Support</h3>
          <p>JavaScript, Python, Java, C++, Go, Rust, and 14+ more languages</p>
        </div>
        <div className="feature-card">
          <h3>Professional Editor</h3>
          <p>Monaco Editor with syntax highlighting, IntelliSense, and auto-completion</p>
        </div>
        <div className="feature-card">
          <h3>Save & Share</h3>
          <p>Save your snippets and share them with the community</p>
        </div>
        <div className="feature-card">
          <h3>Real-time Execution</h3>
          <p>See your code results instantly with console output</p>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="page-content">
      <div className="about-section">
        <h1>About TryAnyCode</h1>
        <p>
          TryAnyCode is a powerful multi-language code compiler that allows developers to write,
          test, and share code snippets in over 20 programming languages. Built with modern web
          technologies, it provides a professional development environment directly in your browser.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Support for 20+ programming languages</li>
          <li>Monaco Editor for professional code editing</li>
          <li>Real-time code execution and output</li>
          <li>Save and organize your code snippets</li>
          <li>Share code publicly with the community</li>
          <li>User authentication and profiles</li>
          <li>Dark and light themes</li>
        </ul>
      </div>
    </div>
  );

  const renderCompiler = () => (
    <div className="compiler-container">
      <div className="compiler-header">
        <input
          type="text"
          className="snippet-title-input"
          value={snippetTitle}
          onChange={(e) => setSnippetTitle(e.target.value)}
          placeholder="Untitled Snippet"
        />

        <div className="compiler-controls">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-select"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
          >
            <option value="vs-dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="hc-black">High Contrast</option>
          </select>

          <button
            onClick={runCode}
            disabled={isRunning}
            className="run-button"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          {user && (
            <>
              <button
                onClick={() => saveSnippet(false)}
                disabled={isSaving}
                className="save-button"
              >
                Save Private
              </button>
              <button
                onClick={() => saveSnippet(true)}
                disabled={isSaving}
                className="save-button public"
              >
                Save Public
              </button>
            </>
          )}
        </div>
      </div>

      <div className="compiler-workspace">
        <div className="editor-panel">
          <div className="panel-header">Editor</div>
          <CodeEditor
            language={getLanguageById(selectedLanguage).monacoLanguage}
            value={code}
            onChange={setCode}
            theme={theme}
          />
        </div>

        <div className="output-panel">
          <div className="preview-section">
            <div className="panel-header">Preview</div>
            <iframe id="preview-iframe" className="preview-frame"></iframe>
          </div>

          <div className="console-section">
            <div className="panel-header">Console Output</div>
            <div className="console-output">
              {consoleOutput.length === 0 ? (
                <div className="console-empty">Run your code to see output...</div>
              ) : (
                consoleOutput.map((log, index) => (
                  <div key={index} className={`console-line console-${log.type}`}>
                    <span className="console-type">[{log.type}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMySnippets = () => (
    <div className="page-content">
      <h1>My Snippets</h1>
      {!user ? (
        <div className="empty-state">
          <p>Please sign in to view your saved snippets</p>
          <button onClick={() => setShowAuthModal(true)} className="cta-button">
            Sign In
          </button>
        </div>
      ) : savedSnippets.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any snippets yet</p>
          <button onClick={() => setCurrentPage('compiler')} className="cta-button">
            Create Your First Snippet
          </button>
        </div>
      ) : (
        <div className="snippets-grid">
          {savedSnippets.map(snippet => (
            <div key={snippet.id} className="snippet-card">
              <h3>{snippet.title}</h3>
              <p className="snippet-language">{getLanguageById(snippet.language).name}</p>
              <p className="snippet-date">
                {new Date(snippet.updated_at).toLocaleDateString()}
              </p>
              <div className="snippet-actions">
                <button onClick={() => loadSnippet(snippet)} className="load-button">
                  Load
                </button>
                <span className="snippet-visibility">
                  {snippet.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="page-content">
      <h1>Public Gallery</h1>
      {publicSnippets.length === 0 ? (
        <div className="empty-state">
          <p>No public snippets yet</p>
        </div>
      ) : (
        <div className="snippets-grid">
          {publicSnippets.map(snippet => (
            <div key={snippet.id} className="snippet-card">
              <div className="snippet-author">
                by {snippet.profiles?.username || 'Anonymous'}
              </div>
              <h3>{snippet.title}</h3>
              <p className="snippet-language">{getLanguageById(snippet.language).name}</p>
              <p className="snippet-stats">
                Views: {snippet.view_count} | Forks: {snippet.fork_count}
              </p>
              <div className="snippet-actions">
                <button onClick={() => loadSnippet(snippet)} className="load-button">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setCurrentPage('home')}>
          TryAnyCode
        </div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('home')}>Home</button>
          <button onClick={() => setCurrentPage('compiler')}>Compiler</button>
          <button onClick={() => setCurrentPage('my-snippets')}>My Snippets</button>
          <button onClick={() => setCurrentPage('gallery')}>Gallery</button>
          <button onClick={() => setCurrentPage('about')}>About</button>
        </div>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-name">{profile?.username || 'User'}</span>
              <button onClick={signOut} className="auth-button">Sign Out</button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="auth-button">
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'about' && renderAbout()}
        {currentPage === 'compiler' && renderCompiler()}
        {currentPage === 'my-snippets' && renderMySnippets()}
        {currentPage === 'gallery' && renderGallery()}
      </main>

      {showAuthModal && <Auth onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompilerApp />
    </AuthProvider>
  );
}

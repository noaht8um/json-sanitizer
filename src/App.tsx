import { useEffect, useRef, useState } from 'react';
import { FaGithub, FaMoon, FaSun } from 'react-icons/fa6';
import {
  APP_NAME,
  AUTHOR_NAME,
  AUTHOR_URL,
  DARK_THEME,
  LIGHT_THEME,
  REPO_URL,
  SAMPLE_JSON,
  STACK_ITEMS,
  THEME_STORAGE_KEY,
  USE_CASES,
} from './lib/app-config';
import { ARRAY_MODES, type ArrayMode, sanitize } from './lib/sanitize';

/**
 * @param inputText The JSON string to be sanitized.
 * @returns An object containing the sanitized output and any error message.
 */
function getSanitizedOutput(inputText: string, arrayMode: ArrayMode) {
  if (!inputText.trim()) {
    return {
      outputText: '',
      errorMessage: '',
    };
  }

  try {
    const parsed = JSON.parse(inputText);
    const sanitized = sanitize(parsed, { arrayMode });

    return {
      outputText: JSON.stringify(sanitized, null, 2),
      errorMessage: '',
    };
  } catch {
    return {
      outputText: '',
      errorMessage: 'Enter valid JSON to generate sanitized output.',
    };
  }
}

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === LIGHT_THEME || storedTheme === DARK_THEME) {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK_THEME
    : LIGHT_THEME;
}

export default function App() {
  const [inputText, setInputText] = useState(SAMPLE_JSON);
  const [arrayMode, setArrayMode] = useState<ArrayMode>('all');
  const [theme, setTheme] = useState(getInitialTheme);
  const { outputText, errorMessage } = getSanitizedOutput(inputText, arrayMode);
  const [copyToast, setCopyToast] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);
  const copyToastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  async function handleCopy() {
    if (!outputText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setCopyToast({ tone: 'success', message: 'Sanitized JSON copied.' });
    } catch {
      setCopyToast({ tone: 'error', message: 'Copy failed.' });
    }

    if (copyToastTimeoutRef.current) {
      window.clearTimeout(copyToastTimeoutRef.current);
    }

    copyToastTimeoutRef.current = window.setTimeout(() => {
      setCopyToast(null);
      copyToastTimeoutRef.current = null;
    }, 1500);
  }

  function handleClear() {
    setInputText('');
  }

  return (
    <div className="min-h-screen bg-base-200 font-(--font-body)">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <section className="card w-full border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-6">
            {/* Header */}
            <header className="flex flex-col gap-4 border-b border-base-300 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <h1>
                    <img
                      src={
                        theme === DARK_THEME
                          ? '/logo-dark.svg'
                          : '/logo-light.svg'
                      }
                      alt={APP_NAME}
                      className="h-9 w-auto sm:h-11"
                    />
                  </h1>
                  <div className="badge badge-soft badge-primary">
                    Runs in your browser
                  </div>
                </div>

                {/* Rotating use cases */}
                <div className="max-w-3xl space-y-2 text-sm leading-6 text-base-content/70 sm:text-base">
                  <p>
                    Paste JSON and get a sanitized version that is safer to
                    share.
                  </p>
                  <p>
                    Useful when you want to{' '}
                    <span className="text-rotate align-middle font-medium text-base-content">
                      <span>
                        {USE_CASES.map((useCase) => (
                          <span key={useCase}>{useCase}</span>
                        ))}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 self-start">
                <div className="join rounded-box border border-base-300 p-1">
                  <label
                    className={`btn btn-sm btn-square join-item ${theme === LIGHT_THEME ? 'btn-active' : 'btn-ghost'}`}
                    title="Light theme"
                  >
                    <FaSun aria-hidden="true" />
                    <span className="sr-only">Use light theme</span>
                    <input
                      aria-label="Use light theme"
                      type="radio"
                      name="theme-picker"
                      value={LIGHT_THEME}
                      className="theme-controller sr-only"
                      checked={theme === LIGHT_THEME}
                      onChange={() => setTheme(LIGHT_THEME)}
                    />
                  </label>
                  <label
                    className={`btn btn-sm btn-square join-item ${theme === DARK_THEME ? 'btn-active' : 'btn-ghost'}`}
                    title="Dark theme"
                  >
                    <FaMoon aria-hidden="true" />
                    <span className="sr-only">Use dark theme</span>
                    <input
                      aria-label="Use dark theme"
                      type="radio"
                      name="theme-picker"
                      value={DARK_THEME}
                      className="theme-controller sr-only"
                      checked={theme === DARK_THEME}
                      onChange={() => setTheme(DARK_THEME)}
                    />
                  </label>
                </div>

                <div className="join">
                  <a
                    className="btn btn-sm btn-ghost join-item normal-case"
                    href={AUTHOR_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {AUTHOR_NAME}
                  </a>
                  <a
                    className="btn btn-sm btn-outline join-item"
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaGithub className="size-4" aria-hidden="true" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </header>

            {/* Warning */}
            <div
              role="alert"
              className="alert alert-warning alert-soft text-sm"
            >
              <span>
                Keys stay unchanged. Boolean and null values remain visible.
              </span>
            </div>

            {/* Toolbar placeholders */}
            <section className="rounded-box border border-base-300 bg-base-200/40 px-2 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="join">
                  <div
                    className="tooltip tooltip-top"
                    data-tip="Copy sanitized JSON to your clipboard"
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={handleCopy}
                      disabled={!outputText}
                    >
                      Copy
                    </button>
                  </div>
                  <div
                    className="tooltip tooltip-top"
                    data-tip="Clear the current JSON input and output"
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={handleClear}
                      disabled={!inputText}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div
                  className="tooltip tooltip-top"
                  data-tip="Choose how arrays are represented in the sanitized output"
                >
                  <select
                    aria-label="Array sanitization mode"
                    className="select select-sm max-w-44"
                    value={arrayMode}
                    onChange={(event) =>
                      setArrayMode(event.target.value as ArrayMode)
                    }
                  >
                    {ARRAY_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {`Array mode: ${mode}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* JSON panels */}
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              {/* Input panel */}
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">Original JSON</legend>
                <p className="label">Paste the JSON you want to sanitize.</p>

                <div className="w-full">
                  <textarea
                    aria-label="Original JSON input"
                    className="textarea min-h-96 w-full font-(--font-mono) text-sm"
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    spellCheck={false}
                  />
                </div>

                {errorMessage ? (
                  <p className="label text-error">{errorMessage}</p>
                ) : (
                  <p className="label">
                    String and number values are replaced automatically.
                  </p>
                )}
              </fieldset>

              {/* Split divider */}
              <div className="divider lg:divider-horizontal" />

              {/* Output panel */}
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">Sanitized JSON</legend>
                <p className="label">Copy this version into your prompt.</p>

                <div className="w-full">
                  <textarea
                    aria-label="Sanitized JSON output"
                    className="textarea min-h-96 w-full font-(--font-mono) text-sm"
                    value={outputText}
                    readOnly
                    spellCheck={false}
                  />
                </div>

                <p className="label">
                  Keys stay visible so you keep the structure.
                </p>
              </fieldset>
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="collapse collapse-arrow border border-base-300 bg-base-100 shadow-sm">
          <input type="checkbox" />

          {/* About summary */}
          <div className="collapse-title flex items-center gap-3 pr-10 text-sm font-medium sm:text-base">
            <span className="badge badge-soft badge-secondary">About</span>
            <span>Future plans, stack, etc.</span>
          </div>

          {/* About content */}
          <div className="collapse-content">
            <div className="grid gap-4 pt-2 md:grid-cols-3">
              {/* Future Plans */}
              <article className="card border border-base-300 bg-base-200/60">
                <div className="card-body gap-3 p-5">
                  <h2 className="card-title text-base">Future Plans</h2>
                  <ul className="list text-sm text-base-content/75">
                    <li className="list-row">Custom placeholder options</li>
                    <li className="list-row">
                      Integration with faker.js for more realistic placeholders
                    </li>
                    <li className="list-row">
                      Upload JSON files directly instead of copy-pasting
                    </li>
                    <li className="list-row">
                      Option to sanitize keys in addition to values
                    </li>
                  </ul>
                </div>
              </article>

              {/* Stack */}
              <article className="card border border-base-300 bg-base-200/60">
                <div className="card-body gap-3 p-5">
                  <h2 className="card-title text-base">Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {[...STACK_ITEMS].sort().map((item) => (
                      <span
                        key={item}
                        className="badge hover:badge-primary badge-outline badge-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              {/* Credit */}
              <article className="card border border-base-300 bg-base-200/60">
                <div className="card-body gap-3 p-5">
                  <h2 className="card-title text-base">Credit</h2>
                  <p className="text-sm leading-6 text-base-content/75">
                    Logo design by Tina Tatum. 🧡
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* Copy feedback toast */}
      {copyToast ? (
        <div className="toast toast-end toast-bottom z-50">
          <div
            role="alert"
            className={`alert ${copyToast.tone === 'success' ? 'alert-success' : 'alert-error'}`}
          >
            <span>{copyToast.message}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

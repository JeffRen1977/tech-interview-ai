import React, { useEffect, useRef } from 'react';

// A flag to ensure the loader script is only added once
let isMonacoLoading = false;
let monacoLoadPromise = null;

const MonacoEditor = ({ language = 'python', value = '', onChange }) => {
    const editorRef = useRef(null);
    const editorInstance = useRef(null);

    const loadMonaco = () => {
        if (!monacoLoadPromise) {
            monacoLoadPromise = new Promise((resolve, reject) => {
                if (window.monaco) {
                    return resolve(window.monaco);
                }
                if (isMonacoLoading) {
                    // If already loading, wait for it to finish
                    document.addEventListener('monaco_init', () => resolve(window.monaco));
                    return;
                }
                isMonacoLoading = true;
                const loaderScript = document.createElement('script');
                loaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
                loaderScript.async = true;
                loaderScript.onload = () => {
                    window.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
                    window.require(['vs/editor/editor.main'], (monaco) => {
                        document.dispatchEvent(new Event('monaco_init'));
                        resolve(monaco);
                    });
                };
                loaderScript.onerror = reject;
                document.body.appendChild(loaderScript);
            });
        }
        return monacoLoadPromise;
    };

    useEffect(() => {
        let editor;
        loadMonaco().then(monaco => {
            if (editorRef.current) {
                editor = monaco.editor.create(editorRef.current, {
                    value: value,
                    language: language,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on'
                });

                editorInstance.current = editor;

                editor.onDidChangeModelContent(() => {
                    const currentValue = editor.getValue();
                    if (currentValue !== value) {
                       onChange?.(currentValue);
                    }
                });
            }
        });

        return () => {
            if (editorInstance.current) {
                editorInstance.current.dispose();
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        if (editorInstance.current && editorInstance.current.getValue() !== value) {
            editorInstance.current.setValue(value);
        }
    }, [value]);
    
    useEffect(() => {
        if(editorInstance.current && window.monaco) {
            window.monaco.editor.setModelLanguage(editorInstance.current.getModel(), language);
        }
    }, [language]);

    return <div ref={editorRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default MonacoEditor;

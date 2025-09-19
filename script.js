function hideAllSections() {
    document.getElementById('homeContent').style.display = 'none';
    document.getElementById('aboutContent').style.display = 'none';
    document.getElementById('codeCompiler').style.display = 'none';
}

document.getElementById('homeLink').addEventListener('click', function() {
    hideAllSections();
    document.getElementById('homeContent').style.display = 'block';
});

document.getElementById('aboutLink').addEventListener('click', function() {
    hideAllSections();
    document.getElementById('aboutContent').style.display = 'block';
});

document.getElementById('tryCodeLink').addEventListener('click', function() {
    hideAllSections();
    document.getElementById('codeCompiler').style.display = 'block';
});

function switchTab(tab) {
    document.getElementById('htmlInput').style.display = 'none';
    document.getElementById('cssInput').style.display = 'none';
    document.getElementById('jsInput').style.display = 'none';

    document.getElementById('htmlTab').classList.remove('active-tab');
    document.getElementById('cssTab').classList.remove('active-tab');
    document.getElementById('jsTab').classList.remove('active-tab');

    if (tab === 'html') {
        document.getElementById('htmlInput').style.display = 'block';
        document.getElementById('htmlTab').classList.add('active-tab');
    } else if (tab === 'css') {
        document.getElementById('cssInput').style.display = 'block';
        document.getElementById('cssTab').classList.add('active-tab');
    } else if (tab === 'js') {
        document.getElementById('jsInput').style.display = 'block';
        document.getElementById('jsTab').classList.add('active-tab');
    }
}

function runCode() {
    const htmlCode = document.getElementById('htmlInput').value;
    const cssCode = document.getElementById('cssInput').value;
    const jsCode = document.getElementById('jsInput').value;

    const previewFrame = document.getElementById('previewFrame');
    const codeDisplay = document.getElementById('codeDisplay');

    const code = `
        <html>
            <head>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}</script>
            </body>
        </html>
    `;

    codeDisplay.textContent = code;

    const iframeDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(code);
    iframeDocument.close();
}

function loadCompiler() {
    hideAllSections();
    document.getElementById('codeCompiler').style.display = 'block';
}

window.onload = function() {
    switchTab('html');
    runCode();
};

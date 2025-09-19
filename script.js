Script.js

// Hide all content sections
function hideAllSections() {
    document.getElementById('homeContent').style.display = 'none';
    document.getElementById('aboutContent').style.display = 'none';
    document.getElementById('codeCompiler').style.display = 'none';
}

// Show the homepage content
document.getElementById('homeLink').addEventListener('click', function() {
    hideAllSections();
    document.getElementById('homeContent').style.display = 'block';
});

// Show the "About Us" page
document.getElementById('aboutLink').addEventListener('click', function() {
    hideAllSections();
    document.getElementById('aboutContent').style.display = 'block';
});

// Show the Code Compiler page
document.getElementById('tryCodeLink').addEventListener('click', function() {
    hideAllSections();
    document.getElementById('codeCompiler').style.display = 'block';
});

// Switch between tabs (HTML, CSS, JavaScript)
function switchTab(tab) {
    // Hide all textareas
    document.getElementById('htmlInput').style.display = 'none';
    document.getElementById('cssInput').style.display = 'none';
    document.getElementById('jsInput').style.display = 'none';

    // Remove active-tab class from all tabs
    document.getElementById('htmlTab').classList.remove('active-tab');
    document.getElementById('cssTab').classList.remove('active-tab');
    document.getElementById('jsTab').classList.remove('active-tab');

    // Show the selected tab's textarea
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

// Function to run the HTML, CSS, and JavaScript code and display the result
function runCode() {
    const htmlCode = document.getElementById('htmlInput').value;
    const cssCode = document.getElementById('cssInput').value;
    const jsCode = document.getElementById('jsInput').value;

    const previewFrame = document.getElementById('previewFrame');
    const codeDisplay = document.getElementById('codeDisplay');

    // Combine HTML, CSS, and JS into a single document for preview
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

    // Display the entered code in the output
    codeDisplay.textContent = code;

    // Safely write the combined code to the iframe
    const iframeDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(code);
    iframeDocument.close();
}

// Load the code compiler when the page loads
function loadCompiler() {
    hideAllSections();
    document.getElementById('codeCompiler').style.display = 'block';
}

// Initialize the page
window.onload = function() {
    switchTab('html');
    runCode();
};

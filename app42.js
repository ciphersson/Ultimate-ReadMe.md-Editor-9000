// Minimal Markdown parser (headings, bold, italic, code, lists, links)
function parseMarkdown(md) {
    let html = md
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim, '<i>$1</i>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
        .replace(/^\s*[-*+] (.*)$/gim, '<li>$1</li>')
        .replace(/<li>([\s\S]*?)<\/li>/gim, '<ul><li>$1</li></ul>');
    html = '<p>' + html + '</p>';
    // Merge consecutive <ul> tags
    html = html.replace(/<\/ul>\s*<ul>/gim, '');
    return html;
}

const input = document.getElementById('markdownInput');
const preview = document.getElementById('preview');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importMd = document.getElementById('importMd');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const rawMarkdown = document.getElementById('rawMarkdown');
const wysiwygToolbar = document.getElementById('wysiwygToolbar');

function updatePreview() {
    const md = input.value;
    preview.innerHTML = parseMarkdown(md);
}

function updateViewMode() {
    if (toggleViewBtn.classList.contains('show-raw')) {
        // Show raw markdown, hide preview
        preview.style.display = 'none';
        rawMarkdown.style.display = 'block';
        rawMarkdown.textContent = input.value;
        toggleViewBtn.textContent = 'Show End User View';
    } else {
        // Show preview, hide raw markdown
        preview.style.display = 'block';
        rawMarkdown.style.display = 'none';
        toggleViewBtn.textContent = 'Show Raw Markdown';
    }
}

input.addEventListener('input', function() {
    if (toggleViewBtn.classList.contains('show-raw')) {
        rawMarkdown.textContent = input.value;
    } else {
        updatePreview();
    }
});

window.addEventListener('DOMContentLoaded', updatePreview);

exportBtn.addEventListener('click', function() {
    const blob = new Blob([input.value], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'README.md';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
});

importBtn.addEventListener('click', function() {
    importMd.click();
});

importMd.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        input.value = ev.target.result;
        updatePreview();
    };
    reader.readAsText(file);
});

if (toggleViewBtn && rawMarkdown) {
    toggleViewBtn.addEventListener('click', function() {
        toggleViewBtn.classList.toggle('show-raw');
        updateViewMode();
    });
    // Initialize
    updateViewMode();
}

// Dropdown Cheat Sheet logic
const cheatSheetBtn = document.getElementById('cheatSheetBtn');
const cheatSheetMenu = document.getElementById('cheatSheetMenu');
const dropdown = cheatSheetBtn ? cheatSheetBtn.closest('.dropdown') : null;

if (cheatSheetBtn && cheatSheetMenu && dropdown) {
    cheatSheetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// --- WYSIWYG Toolbar Setup ---
function createToolbar() {
    if (!wysiwygToolbar) return;
    wysiwygToolbar.innerHTML = `
        <button data-cmd="bold" title="Bold"><b>B</b></button>
        <button data-cmd="italic" title="Italic"><i>I</i></button>
        <button data-cmd="h1" title="# Heading 1">H1</button>
        <button data-cmd="h2" title="## Heading 2">H2</button>
        <button data-cmd="h3" title="### Heading 3">H3</button>
        <button data-cmd="ul" title="Unordered List">• List</button>
        <button data-cmd="ol" title="Ordered List">1. List</button>
        <button data-cmd="code" title="Inline Code">&lt;/&gt;</button>
        <button data-cmd="link" title="Link">🔗</button>
    `;
}
createToolbar();

function toggleWysiwygToolbar(show) {
    wysiwygToolbar.style.display = show ? 'flex' : 'none';
}

toggleWysiwygToolbar(true); // Always show for now

// --- HTML <-> Markdown Conversion Utilities ---
function htmlToMarkdown(html) {
    // Very basic conversion for demo purposes
    let md = html;
    md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n');
    md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n');
    md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n');
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, function(match, items){
        return items.replace(/<li>(.*?)<\/li>/g, '- $1');
    });
    md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, function(match, items){
        return items.replace(/<li>(.*?)<\/li>/g, function(_, item, idx) {
            return '1. ' + item;
        });
    });
    md = md.replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<br\s*\/?>(\n)?/gi, '\n');
    md = md.replace(/<div>([\s\S]*?)<\/div>/gi, '$1');
    md = md.replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/<[^>]+>/g, ''); // Remove remaining tags
    return md.trim();
}

function markdownToHtml(md) {
    return parseMarkdown(md);
}

// --- WYSIWYG Editing Logic ---
if (wysiwygToolbar && preview) {
    wysiwygToolbar.addEventListener('click', function(e) {
        if (e.target.dataset && e.target.dataset.cmd) {
            let cmd = e.target.dataset.cmd;
            if (cmd === 'bold') {
                document.execCommand('bold');
            } else if (cmd === 'italic') {
                document.execCommand('italic');
            } else if (cmd === 'h1') {
                document.execCommand('formatBlock', false, 'h1');
            } else if (cmd === 'h2') {
                document.execCommand('formatBlock', false, 'h2');
            } else if (cmd === 'h3') {
                document.execCommand('formatBlock', false, 'h3');
            } else if (cmd === 'ul') {
                document.execCommand('insertUnorderedList');
            } else if (cmd === 'ol') {
                document.execCommand('insertOrderedList');
            } else if (cmd === 'code') {
                document.execCommand('insertHTML', false, '<code>' + document.getSelection() + '</code>');
            } else if (cmd === 'link') {
                let url = prompt('Enter URL:');
                if (url) document.execCommand('createLink', false, url);
            }
            // After command, sync to textarea
            setTimeout(syncPreviewToMd, 0);
        }
    });
    // When editing preview directly, update markdown textarea
    preview.addEventListener('input', function() {
        // Only update the textarea, don't call updatePreview() which would overwrite preview
        let md = htmlToMarkdown(preview.innerHTML);
        // Prevent backwards text by not calling updatePreview() immediately after
        input.value = md;
    });
}

function syncPreviewToMd() {
    // Convert preview HTML to markdown and update textarea
    let md = htmlToMarkdown(preview.innerHTML);
    input.value = md;
    // Do not call updatePreview() here to avoid overwriting preview content
}

// When textarea changes, update preview (unless user is actively editing preview)
let ignoreInputEvent = false;
input.addEventListener('input', function() {
    if (!ignoreInputEvent) {
        preview.innerHTML = markdownToHtml(input.value);
    }
});

// When switching view modes, keep preview and textarea in sync
if (toggleViewBtn && rawMarkdown) {
    toggleViewBtn.addEventListener('click', function() {
        updateViewMode();
        if (!toggleViewBtn.classList.contains('show-raw')) {
            preview.innerHTML = markdownToHtml(input.value);
        }
    });
}

// Initial sync
preview.innerHTML = markdownToHtml(input.value);

// --- README TEMPLATE INSERTION ---
const insertTemplateBtn = document.getElementById('insertTemplateBtn');
if (insertTemplateBtn) {
    insertTemplateBtn.addEventListener('click', function() {
        const template = `# Project Title\n\nA brief description of what this project does and who it's for\n\n## Table of Contents\n- [About The Project](#about-the-project)\n- [Getting Started](#getting-started)\n- [Usage](#usage)\n- [Roadmap](#roadmap)\n- [Contributing](#contributing)\n- [License](#license)\n- [Contact](#contact)\n\n## About The Project\nDescribe your project in detail.\n\n## Getting Started\nInstructions on setting up your project locally.\n\n### Prerequisites\n- List prerequisites\n\n### Installation\n1. Step one\n2. Step two\n\n## Usage\nShow examples and screenshots.\n\n## Roadmap\n- [ ] Add more features\n- [ ] Multi-language support\n\n## Contributing\nContributions are welcome!\n\n## License\nDistributed under the MIT License.\n\n## Contact\nYour Name - your@email.com\n`;
        input.value = template;
        updatePreview();
        preview.innerHTML = markdownToHtml(template);
    });
}

// --- SECTION SNIPPET/COMPONENT INSERTION ---
const insertSectionBtn = document.getElementById('insertSectionBtn');
const sectionModal = document.getElementById('sectionModal');
const closeSectionModal = document.getElementById('closeSectionModal');
const sectionList = document.querySelector('.section-list');

const sectionSnippets = {
    'about': `## About The Project\nDescribe your project in detail.\n` ,
    'getting-started': `## Getting Started\nInstructions on setting up your project locally.\n\n### Prerequisites\n- List prerequisites\n\n### Installation\n1. Step one\n2. Step two\n`,
    'usage': `## Usage\nShow examples and screenshots.\n`,
    'roadmap': `## Roadmap\n- [ ] Add more features\n- [ ] Multi-language support\n`,
    'contributing': `## Contributing\nContributions are welcome!\n`,
    'license': `## License\nDistributed under the MIT License.\n`,
    'contact': `## Contact\nYour Name - your@email.com\n`,
};

// --- MULTI-LANGUAGE SUPPORT (SECTION INSERTION) ---
// Add language options to the section modal
const multiLangSections = {
    'en': {
        label: 'English',
        about: `## About The Project\nDescribe your project in detail.\n`,
        'getting-started': `## Getting Started\nInstructions on setting up your project locally.\n\n### Prerequisites\n- List prerequisites\n\n### Installation\n1. Step one\n2. Step two\n`,
        usage: `## Usage\nShow examples and screenshots.\n`,
        roadmap: `## Roadmap\n- [ ] Add more features\n- [ ] Multi-language support\n`,
        contributing: `## Contributing\nContributions are welcome!\n`,
        license: `## License\nDistributed under the MIT License.\n`,
        contact: `## Contact\nYour Name - your@email.com\n`,
    },
    'es': {
        label: 'Spanish',
        about: `## Sobre el proyecto\nDescribe tu proyecto en detalle.\n`,
        'getting-started': `## Inicio\nInstrucciones para configurar tu proyecto localmente.\n\n### Requisitos previos\n- Lista de requisitos previos\n\n### Instalación\n1. Paso uno\n2. Paso dos\n`,
        usage: `## Uso\nMuestra ejemplos y capturas de pantalla.\n`,
        roadmap: `## Hoja de ruta\n- [ ] Agregar más características\n- [ ] Soporte multilingüe\n`,
        contributing: `## Contribuciones\nLas contribuciones son bienvenidas!\n`,
        license: `## Licencia\nDistribuido bajo la licencia MIT.\n`,
        contact: `## Contacto\nTu nombre - tu@email.com\n`,
    },
    'zh': {
        label: 'Chinese',
        about: `## 关于项目\n详细描述你的项目。\n`,
        'getting-started': `## 入门\n在本地设置项目的说明。\n\n### 前提条件\n- 列出前提条件\n\n### 安装\n1. 步骤一\n2. 步骤二\n`,
        usage: `## 用法\n展示示例和截图。\n`,
        roadmap: `## 路线图\n- [ ] 添加更多功能\n- [ ] 多语言支持\n`,
        contributing: `## 贡献\n欢迎贡献!\n`,
        license: `## 许可证\n在 MIT 许可证下发布。\n`,
        contact: `## 联系方式\n您的名字 - 你的邮箱\n`,
    }
};
let currentLang = 'en';
const langSelect = document.createElement('select');
langSelect.id = 'sectionLangSelect';
for (const code in multiLangSections) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = multiLangSections[code].label;
    langSelect.appendChild(opt);
}
const sectionModalContent = document.querySelector('.modal-content');
if (sectionModalContent) {
    sectionModalContent.insertBefore(langSelect, sectionModalContent.children[2]);
    langSelect.addEventListener('change', function() {
        currentLang = langSelect.value;
    });
}
if (insertSectionBtn && sectionModal && closeSectionModal && sectionList) {
    insertSectionBtn.addEventListener('click', function() {
        sectionModal.style.display = 'flex';
    });
    closeSectionModal.addEventListener('click', function() {
        sectionModal.style.display = 'none';
    });
    sectionList.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.section) {
            const sec = e.target.dataset.section;
            const snippet = multiLangSections[currentLang][sec] || sectionSnippets[sec];
            // Insert at cursor or append
            insertAtCursor(input, snippet);
            updatePreview();
            preview.innerHTML = markdownToHtml(input.value);
            sectionModal.style.display = 'none';
        }
    });
}
// Helper to insert at cursor position in textarea
function insertAtCursor(textarea, text) {
    if (document.activeElement !== textarea) textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + text + after;
    // Move cursor to after inserted text
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

// --- IMAGE UPLOAD/DRAG-AND-DROP ---
const uploadImageBtn = document.getElementById('uploadImageBtn');
const hiddenImageInput = document.getElementById('hiddenImageInput');

if (uploadImageBtn && hiddenImageInput) {
    uploadImageBtn.addEventListener('click', function() {
        hiddenImageInput.value = '';
        hiddenImageInput.click();
    });
    hiddenImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const md = `![${file.name}](${url})\n`;
            insertAtCursor(input, md);
            updatePreview();
            preview.innerHTML = markdownToHtml(input.value);
        }
    });
}
// Drag-and-drop support on textarea
input.addEventListener('dragover', function(e) {
    e.preventDefault();
});
input.addEventListener('drop', function(e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            const md = `![${file.name}](${url})\n`;
            insertAtCursor(input, md);
            updatePreview();
            preview.innerHTML = markdownToHtml(input.value);
        }
    }
});

// --- TABLE OF CONTENTS GENERATOR ---
const generateTocBtn = document.getElementById('generateTocBtn');
if (generateTocBtn) {
    generateTocBtn.addEventListener('click', function() {
        const md = input.value;
        // Find headings (lines starting with #)
        const lines = md.split(/\r?\n/);
        const tocLines = [];
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/^(#{1,6})\s+(.+)/);
            if (match) {
                const level = match[1].length;
                const text = match[2].replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links in headings
                const anchor = text.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                tocLines.push(`${'  '.repeat(level-1)}- [${text}](#${anchor})`);
            }
        }
        if (tocLines.length > 0) {
            const toc = tocLines.join('\n') + '\n';
            insertAtCursor(input, toc);
            updatePreview();
            preview.innerHTML = markdownToHtml(input.value);
        } else {
            alert('No headings found to generate a Table of Contents.');
        }
    });
}

// --- BACK TO TOP LINKS ---
function insertBackToTopLinks() {
    const md = input.value;
    const lines = md.split(/\r?\n/);
    let newLines = [];
    for (let i = 0; i < lines.length; i++) {
        newLines.push(lines[i]);
        // Insert after each top-level heading (## or ###)
        if (/^##+\s+/.test(lines[i])) {
            newLines.push('[Back to Top](#top)');
        }
    }
    input.value = newLines.join('\n');
    updatePreview();
    preview.innerHTML = markdownToHtml(input.value);
}
const insertBackToTopBtn = document.createElement('button');
insertBackToTopBtn.textContent = 'Insert Back to Top Links';
insertBackToTopBtn.style.marginLeft = '8px';
insertBackToTopBtn.id = 'insertBackToTopBtn';
document.querySelector('.feature-toolbar').appendChild(insertBackToTopBtn);
insertBackToTopBtn.addEventListener('click', insertBackToTopLinks);

// --- LICENSE SECTION GENERATOR ---
const insertLicenseBtn = document.getElementById('insertLicenseBtn');
const licenseModal = document.getElementById('licenseModal');
const closeLicenseModal = document.getElementById('closeLicenseModal');
const licenseList = document.querySelector('.license-list');

const licenseSnippets = {
    'MIT': `## License\n\n[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n`,
    'Apache-2.0': `## License\n\n[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)\n\nThis project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.\n`,
    'GPL-3.0': `## License\n\n[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)\n\nThis project is licensed under the GPL v3 License - see the [LICENSE](LICENSE) file for details.\n`,
    'BSD-3-Clause': `## License\n\n[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)\n\nThis project is licensed under the BSD 3-Clause License - see the [LICENSE](LICENSE) file for details.\n`,
    'Unlicense': `## License\n\n[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)\n\nThis project is released into the public domain under The Unlicense.\n`,
};

if (insertLicenseBtn && licenseModal && closeLicenseModal && licenseList) {
    insertLicenseBtn.addEventListener('click', function() {
        licenseModal.style.display = 'flex';
    });
    closeLicenseModal.addEventListener('click', function() {
        licenseModal.style.display = 'none';
    });
    licenseList.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.license) {
            const snippet = licenseSnippets[e.target.dataset.license];
            insertAtCursor(input, snippet);
            updatePreview();
            preview.innerHTML = markdownToHtml(input.value);
            licenseModal.style.display = 'none';
        }
    });
}

// --- ENHANCED LIVE PREVIEW: TOGGLE DESKTOP/MOBILE VIEW ---
const previewModeBtn = document.getElementById('previewModeBtn');
const previewSection = document.querySelector('.preview-section');
let isMobilePreview = false;
if (previewModeBtn && previewSection) {
    previewModeBtn.addEventListener('click', function() {
        isMobilePreview = !isMobilePreview;
        if (isMobilePreview) {
            previewSection.classList.add('mobile-preview');
            previewModeBtn.textContent = 'Switch to Desktop View';
        } else {
            previewSection.classList.remove('mobile-preview');
            previewModeBtn.textContent = 'Desktop/Mobile View';
        }
    });
}

// --- EXPORT OPTIONS: MARKDOWN, PDF, HTML ---
const exportDropdown = document.querySelector('.export-dropdown');
if (exportDropdown) {
    // Create dropdown content if not present
    let dropdownContent = exportDropdown.querySelector('.export-dropdown-content');
    if (!dropdownContent) {
        dropdownContent = document.createElement('div');
        dropdownContent.className = 'export-dropdown-content';
        exportDropdown.appendChild(dropdownContent);
    }
    dropdownContent.innerHTML = `
        <button id="exportMdBtn">Export as Markdown</button>
        <button id="exportPdfBtn">Export as PDF</button>
        <button id="exportHtmlBtn">Export as HTML</button>
    `;
    exportDropdown.addEventListener('mouseenter', () => {
        exportDropdown.classList.add('open');
    });
    exportDropdown.addEventListener('mouseleave', () => {
        exportDropdown.classList.remove('open');
    });
}
function downloadFile(filename, content, type) {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
// Export as Markdown
const exportMdBtn = document.getElementById('exportMdBtn');
if (exportMdBtn) {
    exportMdBtn.addEventListener('click', function() {
        downloadFile('README.md', input.value, 'text/markdown');
    });
}
// Export as HTML
const exportHtmlBtn = document.getElementById('exportHtmlBtn');
if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener('click', function() {
        downloadFile('README.html', preview.innerHTML, 'text/html');
    });
}
// Export as PDF (using print to PDF)
const exportPdfBtn = document.getElementById('exportPdfBtn');
if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', function() {
        // Open a new window with the HTML content and trigger print
        const win = window.open('', '_blank');
        win.document.write('<html><head><title>Export PDF</title>');
        win.document.write('<style>body{background:#18191c;color:#e0e0e0;font-family:sans-serif;padding:32px;} h1,h2,h3,h4{color:#80cbc4;}</style>');
        win.document.write('</head><body>');
        win.document.write(preview.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        setTimeout(() => win.print(), 500);
    });
}

// --- SHARE FUNCTIONALITY ---
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
const shareStatus = document.getElementById('shareStatus');
const shareTitleInput = document.getElementById('shareTitle');

function getShareableLink() {
    // Encode the markdown and (optional) title in the URL hash
    const title = shareTitleInput.value.trim();
    const md = encodeURIComponent(input.value);
    let url = window.location.origin + window.location.pathname + '#md=' + md;
    if (title) url += '&title=' + encodeURIComponent(title);
    return url;
}
if (shareBtn && shareModal && closeShareModal && copyShareLinkBtn && shareStatus && shareTitleInput) {
    shareBtn.addEventListener('click', function() {
        shareModal.style.display = 'flex';
        shareStatus.style.display = 'none';
    });
    closeShareModal.addEventListener('click', function() {
        shareModal.style.display = 'none';
    });
    copyShareLinkBtn.addEventListener('click', function() {
        const link = getShareableLink();
        navigator.clipboard.writeText(link).then(() => {
            shareStatus.style.display = 'block';
            setTimeout(() => shareStatus.style.display = 'none', 1800);
        });
    });
}
// On load: if URL hash contains md=, decode and load it
window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash.startsWith('#md=')) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const md = params.get('md');
        const title = params.get('title');
        if (md) {
            input.value = decodeURIComponent(md);
            updatePreview();
            preview.innerHTML = markdownToHtml(input.value);
        }
        if (title && shareTitleInput) {
            shareTitleInput.value = decodeURIComponent(title);
        }
    }
});

// --- LOGO ANIMATION: RANDOM STYLE SWITCHER (NO FONT SIZE CHANGE, AUTO-PAUSE) ---
const logoText = document.getElementById('logoText');
const logoStyles = ['bold', 'italic', 'underline', 'strikethrough', 'overline', 'shadow', 'outline', 'uppercase', 'lowercase', 'capitalize'];
let logoAnimInterval = null;
function randomizeLogoStyle() {
    if (!logoText) return;
    logoText.classList.remove(...logoStyles);
    const shuffled = logoStyles.slice().sort(() => 0.5 - Math.random());
    let count = Math.random() < 0.5 ? 2 : 1;
    if (Math.random() < 0.15) count = 3;
    let addedTransform = false;
    for (let i = 0, applied = 0; i < shuffled.length && applied < count; i++) {
        const style = shuffled[i];
        if (["uppercase","lowercase","capitalize"].includes(style)) {
            if (addedTransform) continue;
            addedTransform = true;
        }
        logoText.classList.add(style);
        applied++;
    }
}
if (logoAnimInterval) clearInterval(logoAnimInterval);
logoAnimInterval = setInterval(randomizeLogoStyle, 120);
randomizeLogoStyle();
setTimeout(() => {
    if (logoAnimInterval) clearInterval(logoAnimInterval);
    logoAnimInterval = null;
}, 7000);

// --- FULLSCREEN TOGGLE FOR PREVIEW AND EDITOR ---
const previewSectionEl = document.querySelector('.preview-section');
const editorSectionEl = document.querySelector('.editor-section');
const previewFullscreenBtn = document.getElementById('previewFullscreenBtn');
const editorFullscreenBtn = document.getElementById('editorFullscreenBtn');

function toggleFullscreen(section, btn) {
    if (!section) return;
    const isFullscreen = section.classList.contains('fullscreen');
    if (isFullscreen) {
        section.classList.remove('fullscreen');
        btn.textContent = '⛶';
        btn.title = 'Toggle Fullscreen';
    } else {
        section.classList.add('fullscreen');
        btn.textContent = '🗗';
        btn.title = 'Exit Fullscreen';
    }
}
if (previewFullscreenBtn && previewSectionEl) {
    previewFullscreenBtn.addEventListener('click', function() {
        toggleFullscreen(previewSectionEl, previewFullscreenBtn);
    });
}
if (editorFullscreenBtn && editorSectionEl) {
    editorFullscreenBtn.addEventListener('click', function() {
        toggleFullscreen(editorSectionEl, editorFullscreenBtn);
    });
}
// ESC key exits fullscreen for both
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (previewSectionEl && previewSectionEl.classList.contains('fullscreen')) {
            toggleFullscreen(previewSectionEl, previewFullscreenBtn);
        }
        if (editorSectionEl && editorSectionEl.classList.contains('fullscreen')) {
            toggleFullscreen(editorSectionEl, editorFullscreenBtn);
        }
    }
});

import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Table as TableIcon, 
  Eraser, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  Code, 
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Check,
  Trash2
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'សរសេរការរៀបរាប់នៅទីនេះ...',
  rows = 4
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const savedSelectionRef = useRef<Range | null>(null);

  // Table Modal State
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Sync value from prop ONLY if editor is not currently focused or if it's completely different
  useEffect(() => {
    const sanitizedVal = value || '';
    setHtmlValue(sanitizedVal);
    
    if (editorRef.current) {
      // Don't replace if activeElement is the editor to prevent caret jumping
      if (document.activeElement !== editorRef.current) {
        if (editorRef.current.innerHTML !== sanitizedVal) {
          editorRef.current.innerHTML = sanitizedVal;
        }
      }
    }
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlValue(content);
      onChange(content);
    }
  };

  const execCmd = (command: string, arg: string | undefined = undefined) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    if (sel) {
      setLinkText(sel.toString() || '');
    }
    setShowLinkModal(true);
  };

  const applyLink = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLinkModal(false);
    restoreSelection();

    if (!linkUrl || linkUrl.trim() === '' || linkUrl === 'https://') return;

    if (linkText.trim()) {
      const aHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-red-600 underline hover:text-red-800">${linkText}</a>`;
      execCmd('insertHTML', aHtml);
    } else {
      execCmd('createLink', linkUrl);
    }
    setLinkUrl('https://');
    setLinkText('');
  };

  const openTableModal = () => {
    saveSelection();
    setShowTableModal(true);
  };

  const applyTable = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTableModal(false);
    restoreSelection();

    let tableHtml = `<table class="w-full my-3 border-collapse border border-gray-300 text-sm">`;
    tableHtml += `<thead><tr class="bg-gray-100 font-bold">`;
    for (let c = 0; c < tableCols; c++) {
      tableHtml += `<th class="border border-gray-300 p-2 text-left">ចំណងជើង ${c + 1}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;

    for (let r = 0; r < tableRows - 1; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td class="border border-gray-300 p-2">ទិន្នន័យ ${r + 1}-${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    execCmd('insertHTML', tableHtml);
  };

  const handleClearFormat = () => {
    if (isSourceMode) return;
    execCmd('removeFormat');
    execCmd('formatBlock', '<p>');
  };

  const handleFormatBlock = (formatTag: string) => {
    if (isSourceMode) return;
    execCmd('formatBlock', `<${formatTag}>`);
  };

  const isEmpty = !htmlValue || htmlValue === '<p><br></p>' || htmlValue === '<div><br></div>' || htmlValue === '<br>';

  return (
    <div className="w-full relative">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-semibold text-gray-700">{label}</label>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsSourceMode(!isSourceMode)}
            className="text-[11px] font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-100 hover:bg-red-50 px-2 py-0.5 rounded-md transition-colors"
            title={isSourceMode ? 'មើល Text Visual' : 'មើល HTML Code'}
          >
            {isSourceMode ? <Eye size={12} /> : <Code size={12} />}
            <span>{isSourceMode ? 'Visual' : 'HTML Code'}</span>
          </button>
        </div>
      )}

      <div className={`border border-gray-300 rounded-xl overflow-hidden transition-all bg-white shadow-2xs ${isFocused ? 'border-red-500 ring-2 ring-red-500/20' : 'hover:border-gray-400'}`}>
        {/* Toolbar */}
        {!isSourceMode && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/90 border-b border-gray-200 text-gray-700 select-none">
            {/* Heading Selector */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-2xs">
              <Type size={14} className="text-gray-400 mr-1 shrink-0" />
              <select
                onChange={(e) => handleFormatBlock(e.target.value)}
                className="text-xs bg-transparent font-medium text-gray-700 outline-none cursor-pointer pr-1"
                defaultValue="p"
              >
                <option value="p">Paragraph (ធម្មតា)</option>
                <option value="h1">Heading 1 (ធំបំផុត)</option>
                <option value="h2">Heading 2 (ធំបង្គួរ)</option>
                <option value="h3">Heading 3 (ធំ)</option>
              </select>
            </div>

            <div className="h-4 w-px bg-gray-300 mx-1 shrink-0" />

            {/* Formatting Buttons */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('bold')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black font-bold"
              title="Bold (អក្សរដិត)"
            >
              <Bold size={15} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('italic')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black italic"
              title="Italic (អក្សរទ្រេត)"
            >
              <Italic size={15} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('underline')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Underline (គូសបន្ទាត់ពីក្រោម)"
            >
              <UnderlineIcon size={15} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('strikeThrough')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Strikethrough (គូសបន្ទាត់កាត់)"
            >
              <Strikethrough size={15} />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1 shrink-0" />

            {/* Alignments */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('justifyLeft')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Align Left (តម្រឹមឆ្វេង)"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('justifyCenter')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Align Center (តម្រឹមចិន្ត្រ)"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('justifyRight')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Align Right (តម្រឹមស្តាំ)"
            >
              <AlignRight size={15} />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1 shrink-0" />

            {/* Lists */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('insertUnorderedList')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Bullet List (បញ្ជីចុច)"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('insertOrderedList')}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Numbered List (បញ្ជីលេខ)"
            >
              <ListOrdered size={15} />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1 shrink-0" />

            {/* Link & Table */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openLinkModal}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Insert Link (បញ្ជូនទៅកាន់ Link)"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openTableModal}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors text-gray-700 hover:text-black"
              title="Insert Table (បញ្ចូលតារាង)"
            >
              <TableIcon size={15} />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1 shrink-0" />

            {/* Clear Format */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClearFormat}
              className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors text-gray-600 ml-auto"
              title="Clear Format (លុប Styling)"
            >
              <Eraser size={15} />
            </button>
          </div>
        )}

        {/* Editor Body */}
        {isSourceMode ? (
          <textarea
            value={htmlValue}
            onChange={(e) => {
              setHtmlValue(e.target.value);
              onChange(e.target.value);
            }}
            rows={rows + 3}
            className="w-full p-3 font-mono text-xs text-gray-800 bg-gray-900/5 outline-none resize-y"
            placeholder={placeholder}
          />
        ) : (
          <div className="relative">
            {isEmpty && !isFocused && (
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none text-sm select-none">
                {placeholder}
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                handleInput();
              }}
              className="w-full p-3 outline-none min-h-[110px] max-h-[300px] overflow-y-auto text-sm text-gray-800 leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-1.5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:my-1 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_li]:my-0.5 [&_a]:text-red-600 [&_a]:underline [&_table]:w-full [&_table]:my-2 [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_s]:line-through"
              style={{ minHeight: `${rows * 26}px` }}
            />
          </div>
        )}
      </div>

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <LinkIcon size={18} className="text-red-600" />
                <span>បញ្ចូល Link</span>
              </h3>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={applyLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ពាក្យបង្ហាញ (Text to display)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="ឧ. ចុចទីនេះ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">អាសយដ្ឋាន Link (URL)</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                >
                  បញ្ចូល Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Insertion Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <TableIcon size={18} className="text-red-600" />
                <span>បញ្ចូលតារាង (Table)</span>
              </h3>
              <button 
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={applyTable} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ចំនួនជួរដេក (Rows)</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ចំនួនជួរឈរ (Columns)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
                >
                  បញ្ចូលតារាង
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

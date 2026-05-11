import React, { useState } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

const FileItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="file-item-container">
      <div 
        className="file-item" 
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <FileText size={14} className="file-icon" />
        )}
        {hasChildren && <Folder size={14} className="folder-icon" />}
        <span>{item.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="file-children">
          {item.children.map((child, i) => (
            <FileItem key={i} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = () => {
  const structure = [
    {
      name: 'src',
      children: [
        { name: 'assets', children: [{ name: 'react.svg' }, { name: 'vite.svg' }] },
        { name: 'components', children: [{ name: 'FileTree.jsx' }] },
        { name: 'services', children: [{ name: 'openrouter.js' }] },
        { name: 'App.css' },
        { name: 'App.jsx' },
        { name: 'index.css' },
        { name: 'main.jsx' }
      ]
    },
    { name: 'public', children: [{ name: 'favicon.svg' }, { name: 'icons.svg' }] },
    { name: 'index.html' },
    { name: 'package.json' },
    { name: 'vite.config.js' },
    { name: '.env' }
  ];

  return (
    <div className="file-tree">
      {structure.map((item, i) => (
        <FileItem key={i} item={item} />
      ))}
    </div>
  );
};

export default FileTree;

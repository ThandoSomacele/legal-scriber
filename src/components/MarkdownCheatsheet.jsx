import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MarkdownCheatsheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const cheatsheetContent = [
    { syntax: '# Heading 1', description: 'Creates a top-level heading' },
    { syntax: '## Heading 2', description: 'Creates a second-level heading' },
    { syntax: '**Bold**', description: 'Makes text bold' },
    { syntax: '*Italic*', description: 'Makes text italic' },
    { syntax: '[Link](http://example.com)', description: 'Creates a hyperlink' },
    { syntax: '* Item 1\n* Item 2', description: 'Creates an unordered list' },
    { syntax: '1. Item 1\n2. Item 2', description: 'Creates an ordered list' },
    { syntax: '> Blockquote', description: 'Creates a blockquote' },
    { syntax: '`inline code`', description: 'Formats text as code inline' },
    { syntax: '```\ncode block\n```', description: 'Creates a code block' },
  ];

  return (
    <div className='bg-white shadow-md rounded-lg overflow-hidden mt-5'>
      <button
        className='w-full px-4 py-2 bg-primary-600 text-white flex justify-between items-center'
        onClick={() => setIsOpen(!isOpen)}>
        Markdown Cheatsheet
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className='p-4'>
          <table className='w-full text-left'>
            <thead>
              <tr>
                <th className='pb-2'>Syntax</th>
                <th className='pb-2'>Description</th>
              </tr>
            </thead>
            <tbody>
              {cheatsheetContent.map((item, index) => (
                <tr key={index} className='border-t'>
                  <td className='py-2 pr-4 font-mono text-sm'>{item.syntax}</td>
                  <td className='py-2'>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarkdownCheatsheet;

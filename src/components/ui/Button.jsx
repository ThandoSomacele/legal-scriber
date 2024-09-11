import React from 'react';

export default function button({ btnStyle = 'solid', btnText = 'The Button' }: { btnStyle: string; btnText: string }) {
  if (btnStyle === 'solid') {
    return (
      <a
        className='inline-block rounded-lg border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-bold text-white hover:bg-indigo-800 focus:outline-none focus:ring active:text-indigo-500 transition'
        href='#'>
        {btnText}
      </a>
    );
  } else if (btnStyle === 'outline') {
    return (
      <a
        className='inline-block rounded-lg border border-indigo-600 px-12 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500 transition'
        href='#'>
        {btnText}
      </a>
    );
  }
}

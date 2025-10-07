import React, { useState } from 'react';
import { LANGUAGE_VERSIONS } from '../constants';
import { ChevronDownIcon } from 'lucide-react';

const languages = Object.entries(LANGUAGE_VERSIONS);

function LanguageSelector({ language, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Label */}
      <p className="mb-2 text-base md:text-lg font-medium">Languages:</p>

      {/* Dropdown Button */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-between items-center px-4 py-2 w-40 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 focus:outline-none"
      >
        {language}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </button>

      {/* Dropdown List */}
      {open && (
        <ul className="absolute mt-2 w-48 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-y-auto">
          {languages.map(([lang, version]) => (
            <li
              key={lang}
              onClick={() => {
                onSelect(lang);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-sm md:text-base font-semibold flex justify-between items-center ${
                lang === language
                  ? 'bg-gray-800 text-blue-400'
                  : 'text-gray-200 hover:bg-gray-800 hover:text-blue-400'
              }`}
            >
              {lang}
              <span className="text-gray-400 ml-2">({version})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSelector;

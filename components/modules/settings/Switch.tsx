
import React from 'react';

const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ml-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

export default Switch;

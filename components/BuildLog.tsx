
import React from 'react';

interface BuildLogProps {
  status: "PASS" | "FAIL";
  buildLog: string[];
}

const BuildLog: React.FC<BuildLogProps> = ({ status, buildLog }) => {
  const isPass = status === 'PASS';
  const statusColor = isPass ? 'text-green-400' : 'text-red-400';
  const borderColor = isPass ? 'border-green-700' : 'border-red-700';

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border ${borderColor} rounded-lg p-4`}>
      <h3 className="font-oswald text-xl uppercase text-gray-300 mb-3 flex items-center">
        Build Status: 
        <span className={`ml-2 font-bold ${statusColor}`}>{status}</span>
      </h3>
      <div className="bg-black/50 rounded-md p-3 h-48 overflow-y-auto">
        <code className="text-xs text-gray-400">
          {buildLog.map((log, index) => (
            <p key={index} className="whitespace-pre-wrap">{`> ${log}`}</p>
          ))}
        </code>
      </div>
    </div>
  );
};

export default BuildLog;

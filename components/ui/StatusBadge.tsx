
import React from 'react';
import { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const statusColorMap: Record<ProjectStatus, string> = {
  [ProjectStatus.DEVIS]: 'bg-status-gray text-white',
  [ProjectStatus.EN_COURS]: 'bg-status-yellow text-gray-800',
  [ProjectStatus.TERMINE]: 'bg-status-blue text-white',
  [ProjectStatus.LIVRE]: 'bg-status-green text-white',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${statusColorMap[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

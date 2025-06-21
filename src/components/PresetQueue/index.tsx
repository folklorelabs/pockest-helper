import React from 'react';
import SortableList from './SortableList';
import PresetQueueItem from '../PresetQueueItem';
import { usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function PresetQueue() {
  const {
    pockestState,
  } = usePockestContext();
  
  return (
    <div className="PresetQueue">
      <SortableList items={pockestState.planQueue} ItemComponent={PresetQueueItem} />
    </div>
  );
}

export default PresetQueue;

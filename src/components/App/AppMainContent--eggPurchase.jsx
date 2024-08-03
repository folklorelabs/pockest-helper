import React from 'react';
import BuyEggBtn from '../BuyEggBtn';
import EggControls from '../EggControls';

function AppMainContentEggPurchase() {
  return (
    <>
      <EggControls />
      <div className="App-button">
        <BuyEggBtn />
      </div>
    </>
  );
}

export default AppMainContentEggPurchase;

import BuyEggBtn from '../BuyEggBtn';
import EggControls from '../EggControls';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--eggPurchase"
      content={(<EggControls />)}
      footer={(
        <div className="App-button">
          <BuyEggBtn />
        </div>
      )}
    />
  );
}

export default AppMain;

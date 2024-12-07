import {
  usePockestContext,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import AutoPlanSettingInput from '../AutoPlanSettingInput';
import TargetAgeSelect from '../TargetAgeSelect';
import AutoPlanControlsPlanLabel from '../AutoPlanControls/AutoPlanControls-planLabel';
import AutoPlanControlsStatPlanLabel from '../AutoPlanControls/AutoPlanControls-statPlanLabel';
import './index.css';

function AutoPlanControlsSimple() {
  const {
    pockestState,
  } = usePockestContext();
  return (
    <div className="AutoPlanControls AutoPlanControls--simple">
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect disabled={pockestState?.data?.monster?.live_time ? true : null} />
      </div>
      {pockestState?.simpleMode && pockestState?.monsterId !== -1 ? '' : (
        <>
          <div className="PockestLine">
            <AutoPlanControlsPlanLabel />
            <AutoPlanSettingInput
              settingName="planId"
              required
              disabled={pockestState?.data?.monster?.live_time ? true : null}
            />
          </div>
          <div className="PockestLine">
            <AutoPlanControlsStatPlanLabel />
            <AutoPlanSettingInput
              settingName="statPlanId"
              disabled={pockestState?.data?.monster?.live_time ? true : null}
            />
          </div>
        </>
      )}
      <div className="PockestLine">
        <span className="PockestText">Target Age</span>
        <TargetAgeSelect disabled={pockestState?.data?.monster?.live_time ? true : null} />
      </div>
    </div>
  );
}

export default AutoPlanControlsSimple;

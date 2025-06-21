function AutoPlanControlsStatPlanLabel() {
  return (
    <div className="PockestText">
      Stat Plan
      <a
        className="PockestToolTip"
        href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624#6602623"
        target="_blank"
        rel="noreferrer"
      >
        ℹ️
        <span className="PockestToolTip-text">
          <em>Stat Plans</em>
          {' '}
          are training schedules made up of 0-14 letters.
          Each letter represents a training period with a specified stat.
          The Plan&apos;s Primary Stat is trained for unspecified periods.
          <br />
          <br />
          <em>Training Period (0-14):</em>
          {' '}
          P, S, T
          <br />
          <br />
          <em>Example:</em>
          {' '}
          SSPPTT
          <br />
          0d 00:00: Speed
          <br />
          0d 12:00: Speed
          <br />
          1d 00:00: Power
          <br />
          1d 12:00: Power
          <br />
          2d 00:00: Technique
          <br />
          2d 12:00: Technique
          <br />
          3d - 7d: Primary Stat
        </span>
      </a>
    </div>
  );
}

export default AutoPlanControlsStatPlanLabel;

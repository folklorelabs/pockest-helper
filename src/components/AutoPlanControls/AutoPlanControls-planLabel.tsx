function AutoPlanControlsPlanLabel() {
  return (
    <div className="PockestText">
      Plan
      <a
        className="PockestToolTip"
        href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624#6460421"
        target="_blank"
        rel="noreferrer"
      >
        ℹ️
        <span className="PockestToolTip-text">
          <em>Plans</em>
          {' '}
          are unique paths through the evolution tree and are made up of 5 letters.
          <br />
          <br />
          <em>Egg Generation:</em>
          {' '}
          1, 2, 3, 4, 5, ...
          <br />
          <em>1st Divergence:</em>
          {' '}
          A, B, C
          <br />
          <em>2nd Divergence:</em>
          {' '}
          R, L
          <br />
          <em>Primary Stat:</em>
          {' '}
          P, S, T
          <br />
          <em>Age:</em>
          {' '}
          1, 2, 3, 4, 5, 6
          <br />
          <br />
          <em>Example:</em>
          {' '}
          2ART5
          <br />
          Green Polka-dot egg taking the AR path all the way
          through age 5 with Technique as a primary stat.
        </span>
      </a>
    </div>
  );
}

export default AutoPlanControlsPlanLabel;

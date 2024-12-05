enum ACTION_TYPES {
  INVALIDATE_SESSION = 'POCKEST_INVALIDATE_SESSION',
  EVENT_HATCHING = 'POCKEST_EVENT_HATCHING',
  EVENT_CLEANING = 'POCKEST_EVENT_CLEANING',
  EVENT_TRAINING = 'POCKEST_EVENT_TRAINING',
  EVENT_MEAL = 'POCKEST_EVENT_MEAL',
  EVENT_EXCHANGE = 'POCKEST_EVENT_EXCHANGE',
  EVENT_CURE = 'POCKEST_EVENT_CURE',
  REFRESH_STATUS = 'POCKEST_REFRESH_STATUS',
  REFRESH_EVOLUTION_SUCCESS = 'POCKEST_REFRESH_EVOLUTION_SUCCESS',
  REFRESH_EVOLUTION_FAILURE = 'POCKEST_REFRESH_EVOLUTION_FAILURE',
  REFRESH_DEATH = 'POCKEST_REFRESH_DEATH',
  REFRESH_DEPARTURE = 'POCKEST_REFRESH_DEPARTURE',
  REFRESH_MONSTER_NOT_FOUND = 'POCKEST_REFRESH_MONSTER_NOT_FOUND',
  LOADING = 'POCKEST_LOADING',
  PAUSE = 'POCKEST_PAUSE',
  ERROR = 'POCKEST_ERROR',
  ERROR_HATCH_SYNC = 'POCKEST_ERROR_HATCH_SYNC',
  SETTINGS = 'POCKEST_SETTINGS',
  SET_LOG = 'POCKEST_SET_LOG',
};

export default ACTION_TYPES;
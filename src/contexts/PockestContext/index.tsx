import React, { type ReactNode } from "react";
import fetchMatchList from "../../api/fetchMatchList";
import { postDiscordEvo } from "../../api/postDiscord";
import { STAT_ID } from "../../constants/stats";
import combineDiscordReports from "../../utils/combineDiscordReports";
import getMatchTimer from "../../utils/getMatchTimer";
import log from "../../utils/log";
import * as pockestActions from "./actions";
import ACTION_TYPES from "./constants/ACTION_TYPES";
import * as pockestGetters from "./getters";
import REDUCER from "./reducer";
import {
	fixHelperLogFeverBug,
	getRefreshTimeout,
	getStateFromLocalStorage,
	getStateFromSessionStorage,
	REFRESH_TIMEOUT,
	saveStateToLocalStorage,
	saveStateToSessionStorage,
	setRefreshTimeout,
	startStorageSession,
	validateStorageSession,
} from "./state";
import type Action from "./types/Action";
import type PockestState from "./types/PockestState";

fixHelperLogFeverBug();
startStorageSession();
const initialState = getStateFromSessionStorage() || getStateFromLocalStorage();

interface PockestContextInitialState {
	pockestState: PockestState;
	pockestDispatch: React.Dispatch<Action> | null;
}
const PockestContext = React.createContext({
	pockestState: initialState,
	pockestDispatch: null,
} as PockestContextInitialState);

type PockestProviderProps = {
	children: ReactNode;
};

export function PockestProvider({ children }: PockestProviderProps) {
	const [pockestState, pockestDispatch] = React.useReducer(
		REDUCER,
		initialState,
	);
	const { cleanFrequency, feedFrequency, feedTarget } = React.useMemo(
		() => pockestGetters.getCareSettings(pockestState),
		[pockestState],
	);
	const { currentCleanWindow, currentFeedWindow } = React.useMemo(
		() => pockestGetters.getCurrentPlanScheduleWindows(pockestState),
		[pockestState],
	);

	// invalidate session if need be
	React.useEffect(() => {
		if (!pockestState?.initialized || pockestState?.invalidSession) return;
		if (!validateStorageSession()) {
			// session invalid, we opened a new tab or something. invalidate the session in state.
			(async () => {
				pockestDispatch(pockestActions.pockestInvalidateSession());
			})();
			return;
		}
		saveStateToLocalStorage(pockestState);
		saveStateToSessionStorage(pockestState);
	}, [pockestState]);

	// detect hatch sync issues
	React.useEffect(() => {
		if (
			pockestState?.invalidSession || // we're in bad state; don't update anything
			!pockestState?.initialized || // we're in bad state; don't update anything
			pockestState?.error ||
			pockestState?.loading || // already recovering elsewhere
			!pockestState?.data?.monster?.live_time ||
			pockestState?.data?.event === "hatching" // nothing to desync from
		)
			return;
		const bucklerLiveTimestamp = pockestState?.data?.monster?.live_time;
		const stateLiveTimestamp = pockestState?.eggTimestamp;
		if (stateLiveTimestamp && stateLiveTimestamp !== bucklerLiveTimestamp) {
			log(
				"Detected hatch sync",
				`bucklerLiveTimestamp (${bucklerLiveTimestamp}) !== stateLiveTimestamp (${stateLiveTimestamp})`,
				pockestState,
			);
			pockestDispatch(
				pockestActions.pockestErrorHatchSync(
					"Pockest Helper detected a Monster that it did not hatch. Please refrain from manually hatching monsters as this will reduce the effectiveness of Pockest Helper.",
				),
			);
		}
	}, [pockestState]);

	// refresh status and set next for 5-10 minutes later
	const refreshStatus = React.useCallback(async () => {
		setRefreshTimeout(REFRESH_TIMEOUT.STATUS, 5, 5);
		pockestDispatch(pockestActions.pockestLoading());
		pockestDispatch(await pockestActions.pockestRefresh(pockestState));
	}, [pockestState]);

	// refresh check loop
	React.useEffect(() => {
		if (
			pockestState?.error ||
			pockestState?.loading ||
			pockestState?.invalidSession
		)
			return () => {};
		const interval = window.setInterval(async () => {
			const now = Date.now();
			const nextStatus = getRefreshTimeout(REFRESH_TIMEOUT.STATUS);
			if (now >= nextStatus) await refreshStatus();
		}, 1000);
		return () => {
			window.clearInterval(interval);
		};
	}, [pockestState, refreshStatus]);

	// error loop: attempt to re-init every 1-3 minutes if there is an error
	React.useEffect(() => {
		if (
			!pockestState?.error ||
			pockestState?.loading ||
			pockestState?.invalidSession
		)
			return () => {};
		const interval = window.setInterval(async () => {
			const now = Date.now();
			const nextInit = getRefreshTimeout(REFRESH_TIMEOUT.ERROR);
			if (now >= nextInit) {
				setRefreshTimeout(REFRESH_TIMEOUT.ERROR, 1, 3);
				await refreshStatus();
			}
		}, 1000);
		return () => {
			window.clearInterval(interval);
		};
	}, [pockestState, refreshStatus]);

	// 5 min timeout for loading -- try recovering
	React.useEffect(() => {
		if (!pockestState?.loading) return () => {};
		const timeout = window.setTimeout(() => {
			refreshStatus();
			pockestDispatch([
				ACTION_TYPES.ERROR,
				"App stuck loading for more than 5 minutes. Recovering.",
			]);
		}, 300000);
		return () => {
			window.clearTimeout(timeout);
		};
	}, [pockestState?.loading, refreshStatus]);

	// Lifecycle loop
	React.useEffect(() => {
		if (
			!pockestState?.initialized ||
			pockestState?.loading ||
			pockestState?.paused ||
			pockestState?.error ||
			pockestState?.invalidSession ||
			(pockestState?.autoPlan && pockestState?.evolutionFailed && pockestState?.data?.monster)
		)
			return () => {};
		const interval = window.setInterval(async () => {
			const {
				data,
				autoPlan,
				autoClean,
				autoFeed,
				autoTrain,
				autoMatch,
				autoCure,
				autoQueue,
			} = pockestState;
			const now = new Date();

			// Pause if autoQueueing and presetQueue is empty
			if (autoQueue && !pockestState?.presetQueue?.length) {
				pockestDispatch(pockestActions.pockestPause(true));
				return;
			}

			// Clean up autoQueue stale items
			if (
				autoQueue &&
				!pockestState?.data?.monster &&
				pockestState?.presetQueueId
			) {
				const filteredPresetQueue = pockestState?.presetQueue.filter(
					(queueItem) => queueItem.id !== pockestState?.presetQueueId,
				);
				pockestDispatch(
					pockestActions.pockestSettings({
						presetQueueId: undefined,
						presetQueue: filteredPresetQueue,
					}),
				);
				return;
			}

			// Buy egg if autoQueueing and no existing monster!
			if (
				autoQueue &&
				!pockestState?.data?.monster &&
				!pockestState?.presetQueueId
			) {
				pockestDispatch(pockestActions.pockestLoading());
				pockestDispatch(await pockestActions.pockestRunQueue(pockestState));
				return;
			}

			// No data! Let's refresh to get things moving.
			// If there is a good reason for no data then refreshing will trigger error or pause.
			if (!data) {
				log("Triggering refresh due to no data found.");
				await refreshStatus();
				return;
			}

			const { monster } = data;
			const isStunned = monster?.status === 2;
			const shouldNeglect = monster?.live_time
				? monster.live_time +
						pockestGetters.getPlanNeglectOffset(pockestState) <=
					now.getTime()
				: false;
			const stunOffset = pockestGetters.getPlanStunOffset(pockestState);
			const shouldLetDie =
				monster?.live_time && typeof stunOffset === "number"
					? monster.live_time + stunOffset <= now.getTime()
					: false;

			// Small event refresh
			if (
				data?.next_small_event_timer &&
				now.getTime() > data?.next_small_event_timer
			) {
				log("Triggering refresh due to next_small_event_timer.");
				await refreshStatus();
				return;
			}

			// Big event refresh
			// no refresh if stunned cause the timer doesn't update and it will loop infinitely
			if (
				data?.next_big_event_timer &&
				now.getTime() > data?.next_big_event_timer &&
				!isStunned
			) {
				log("Triggering refresh due to next_big_event_timer.");
				await refreshStatus();
				return;
			}

			// Cure
			if (autoCure && isStunned && !shouldLetDie) {
				log("CURE");
				pockestDispatch(pockestActions.pockestLoading());
				pockestDispatch(await pockestActions.pockestCure());
				return;
			}

			// Clean
			const attemptToClean =
				autoClean &&
				cleanFrequency &&
				monster &&
				monster?.garbage > 0 &&
				!isStunned &&
				!shouldNeglect;
			const inCleanWindow =
				(!autoPlan && cleanFrequency === 2) ||
				(currentCleanWindow &&
					now.getTime() >= currentCleanWindow?.start &&
					now.getTime() <= currentCleanWindow?.end);
			if (attemptToClean && inCleanWindow) {
				log("CLEAN");
				pockestDispatch(pockestActions.pockestLoading());
				pockestDispatch(await pockestActions.pockestClean());
				return;
			}

			// Feed
			const attemptToFeed =
				autoFeed &&
				feedFrequency &&
				monster &&
				monster?.stomach < feedTarget &&
				!isStunned &&
				!shouldNeglect;
			const inFeedWindow =
				(!autoPlan && feedFrequency === 4) ||
				(currentFeedWindow &&
					now.getTime() >= currentFeedWindow?.start &&
					now.getTime() <= currentFeedWindow?.end);
			if (attemptToFeed && inFeedWindow) {
				log("FEED");
				pockestDispatch(pockestActions.pockestLoading());
				pockestDispatch(await pockestActions.pockestFeed());
				return;
			}

			// Train
			const curTrainingInterval = pockestGetters.training.getTrainingInterval(
				pockestState,
				now.getTime(),
			);
			const alreadyTrained = !!curTrainingInterval?.trainingLogs.length;
			const bucklerReadyForTraining =
				monster?.training_time && now.getTime() >= monster?.training_time;
			const willTrain =
				autoTrain &&
				!alreadyTrained &&
				!isStunned &&
				curTrainingInterval?.stat &&
				bucklerReadyForTraining;
			if (willTrain) {
				log(
					`TRAIN, stat=${curTrainingInterval?.stat ? STAT_ID[curTrainingInterval.stat] : null}`,
				);
				pockestDispatch(pockestActions.pockestLoading());
				pockestDispatch(
					await pockestActions.pockestTrain(curTrainingInterval?.stat),
				);
				return;
			}

			// Match
			const attemptToMatch = autoMatch && monster && !isStunned && !willTrain;
			const nextMatchTime = getMatchTimer(pockestState);
			if (attemptToMatch && nextMatchTime && now.getTime() >= nextMatchTime) {
				pockestDispatch(pockestActions.pockestLoading());
				const { exchangeList } = await fetchMatchList();
				if (monster?.age >= 5) {
					// Report missing hashes, names, and stat vals to discord when found on opponents
					const missing = exchangeList.filter((m) => {
						const matchingMonster = pockestState?.allMonsters.find(
							(m2) => m2?.monster_id === m?.monster_id,
						);
						return (
							matchingMonster &&
							matchingMonster?.age >= 5 &&
							!matchingMonster?.confirmed
						);
					});
					if (missing.length) {
						const reportReqs = missing.map((match) =>
							pockestGetters.getDiscordReportSighting(
								pockestState,
								data,
								match,
							),
						);
						const reports = await Promise.all(reportReqs);
						const report = combineDiscordReports(reports);
						postDiscordEvo(report);
					}
				}
				const bestMatch = await pockestGetters.getBestMatch(
					pockestState,
					exchangeList,
				);
				log(`MATCH, bestMatch=${bestMatch?.name_en}`);
				pockestDispatch(
					await pockestActions.pockestMatch(pockestState, bestMatch),
				);
			}
		}, 1000);
		return () => {
			window.clearInterval(interval);
		};
	}, [
		cleanFrequency,
		currentCleanWindow,
		currentFeedWindow,
		feedFrequency,
		feedTarget,
		pockestState,
		refreshStatus,
	]);

	// wrap value in memo so we only re-render when necessary
	const providerValue = React.useMemo(
		() => ({
			pockestState,
			pockestDispatch,
		}),
		[pockestState],
	);

	return (
		<PockestContext.Provider value={providerValue}>
			{children}
		</PockestContext.Provider>
	);
}

export * as pockestActions from "./actions";
export * as pockestGetters from "./getters";
export function usePockestContext() {
	return React.useContext(PockestContext);
}

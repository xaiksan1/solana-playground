import { useAtom } from "jotai";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "../../../routes";
import { TUTORIALS } from "../../../tutorials";
import { EventName } from "../../../constants";
import { terminalProgressAtom } from "../../../state";
import {
  Disposable,
  PgCommon,
  PgConnection,
  PgExplorer,
  PgProgramInfo,
  PgRouter,
  PgTutorial,
  PgView,
  PgWallet,
} from "../../../utils/pg";
import { useDisposable, useGetStatic, useSetStatic } from "../../../hooks";

const GlobalState = () => {
  // Connection
  useDisposable(PgConnection.init);

  // Program info
  useProgramInfo();

  // Router
  useRouter();

  // Terminal progress
  const [, setProgress] = useAtom(terminalProgressAtom);
  useSetStatic(setProgress, EventName.TERMINAL_PROGRESS_SET);

  // Wallet
  useDisposable(PgWallet.init);

  // Workspace
  useWorkspace();

  return null;
};

/** Initialize `PgProgramInfo` on explorer initialization and workspace switch. */
const useProgramInfo = () => {
  useEffect(() => {
    let programInfo: Disposable | undefined;
    const batch = PgCommon.batchChanges(async () => {
      programInfo?.dispose();
      programInfo = await PgProgramInfo.init();
    }, [PgExplorer.onDidInit, PgExplorer.onDidSwitchWorkspace]);

    return () => {
      programInfo?.dispose();
      batch.dispose();
    };
  }, []);
};

/** Handle URL routing. */
const useRouter = () => {
  // Init
  useEffect(() => {
    const { dispose } = PgRouter.init(ROUTES);
    return () => dispose();
  }, []);

  // Location
  const location = useLocation();
  useGetStatic(location, EventName.ROUTER_LOCATION);

  // Navigate
  const navigate = useNavigate();
  useSetStatic(navigate, EventName.ROUTER_NAVIGATE);

  // Change method
  useEffect(() => {
    PgCommon.createAndDispatchCustomEvent(
      EventName.ROUTER_ON_DID_CHANGE_PATH,
      location.pathname
    );
  }, [location.pathname]);
};

/** Handle workspaces/tutorials. */
const useWorkspace = () => {
  // Handle loading state
  useEffect(() => {
    const { dispose } = PgExplorer.onDidInit(async () => {
      // Check whether the tab state is valid
      // Invalid case: https://github.com/solana-playground/solana-playground/issues/91#issuecomment-1336388179
      const tabs = PgExplorer.getTabs();
      if (tabs.length && !PgExplorer.getCurrentFile()) {
        PgExplorer.changeCurrentFile(tabs[0].path);
      }

      await PgCommon.sleep(300);
      PgView.setSidebarLoading(false);
    });
    return () => dispose();
  }, []);

  // Handle workspace switch
  useEffect(() => {
    const { dispose } = PgExplorer.onDidSwitchWorkspace(async () => {
      const name = PgExplorer.currentWorkspaceName;
      if (!name) {
        PgRouter.navigate();
        return;
      }

      const { pathname } = await PgRouter.getLocation();
      if (PgRouter.isPathsEqual(pathname, "/tutorials")) return;

      if (PgTutorial.isWorkspaceTutorial(name)) {
        await PgTutorial.open(name);
      } else {
        PgExplorer.setWorkspaceName(name);
        await PgRouter.navigate();
      }
    });
    return () => dispose();
  }, []);
};

// Set tutorials
PgTutorial.tutorials = TUTORIALS;

export default GlobalState;

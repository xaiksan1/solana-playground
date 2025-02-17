import { MouseEvent, useCallback, useState } from "react";

import { DeleteItem, RenameItem } from "./Modals";
import { ClassName, Id } from "../../../../constants";
import { PgCommand, PgExplorer, PgView } from "../../../../utils/pg";

export type ItemData = {
  [K in
    | "isFolder"
    | "isClient"
    | "isClientFolder"
    | "isTest"
    | "isTestFolder"
    | "isProgramFolder"]?: boolean;
};

export const useExplorerContextMenu = () => {
  const [itemData, setItemData] = useState<ItemData>({});
  const [ctxSelectedPath, setCtxSelectedPath] = useState("");

  const handleMenu = useCallback((ev: MouseEvent<HTMLDivElement>) => {
    // Add selected style to the item
    let itemEl = ev.target as Node;
    while (itemEl.nodeName !== "DIV") {
      itemEl = itemEl.parentNode!;
    }
    const selectedEl = itemEl as HTMLDivElement;

    // Root dir is not allowed to be selected as it cannot be renamed or deleted
    if (selectedEl.id === Id.ROOT_DIR) throw new Error();

    const itemType = PgExplorer.getItemTypeFromEl(selectedEl);
    if (!itemType) throw new Error();

    const itemPath = PgExplorer.getItemPathFromEl(selectedEl)!;
    const itemName = PgExplorer.getItemNameFromPath(itemPath);

    const itemData: ItemData = {
      isFolder: itemType.folder,
      isClient: itemType.file && PgExplorer.getIsItemClientFromEl(selectedEl),
      isClientFolder:
        itemType.folder && itemName === PgExplorer.PATHS.CLIENT_DIRNAME,
      isTest: itemType.file && PgExplorer.getIsItemTestFromEl(selectedEl),
      isTestFolder:
        itemType.folder && itemName === PgExplorer.PATHS.TESTS_DIRNAME,
      isProgramFolder:
        itemType.folder && itemName === PgExplorer.PATHS.SRC_DIRNAME,
    };

    // Convert the `undefined` values to `false` in order to show them only
    // when necessary. (`undefined` defaults to `true` for `showCondition`)
    for (const key in itemData) {
      itemData[key as keyof typeof itemData] ??= false;
    }
    setItemData(itemData);

    PgExplorer.setCtxSelectedEl(selectedEl);
    setCtxSelectedPath(PgExplorer.getItemPathFromEl(selectedEl) ?? "");
  }, []);

  const getPath = useCallback(() => {
    return !ctxSelectedPath
      ? PgExplorer.getItemPathFromEl(PgExplorer.getSelectedEl()) ??
          ctxSelectedPath
      : ctxSelectedPath;
  }, [ctxSelectedPath]);

  // Functions
  const ctxNewItem = useCallback(() => {
    const ctxSelected = PgExplorer.getElFromPath(getPath());

    if (!ctxSelected.classList.contains(ClassName.OPEN)) {
      ctxSelected.classList.add(ClassName.OPEN);
      ctxSelected.nextElementSibling?.classList.remove(ClassName.HIDDEN);
    }
    PgView.setNewItemPortal(ctxSelected.nextElementSibling);
    PgExplorer.setCtxSelectedEl(ctxSelected);
  }, [getPath]);

  const renameItem = useCallback(async () => {
    if (PgExplorer.getCtxSelectedEl()) {
      await PgView.setModal(<RenameItem path={getPath()} />);
    }
  }, [getPath]);

  const deleteItem = useCallback(async () => {
    if (PgExplorer.getCtxSelectedEl()) {
      await PgView.setModal(<DeleteItem path={getPath()} />);
    }
  }, [getPath]);

  const runClient = useCallback(async () => {
    await PgCommand.run.run(getPath());
  }, [getPath]);

  const runTest = useCallback(async () => {
    await PgCommand.test.run(getPath());
  }, [getPath]);

  const runClientFolder = useCallback(async () => {
    await PgCommand.run.run();
  }, []);

  const runTestFolder = useCallback(async () => {
    await PgCommand.test.run();
  }, []);

  const runBuild = useCallback(async () => {
    await PgCommand.build.run();
  }, []);

  return {
    handleMenu,
    ctxNewItem,
    renameItem,
    deleteItem,
    runClient,
    runTest,
    runClientFolder,
    runTestFolder,
    runBuild,
    itemData,
  };
};

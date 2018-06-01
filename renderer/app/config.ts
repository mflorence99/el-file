/**
 * Common configuration settings
 */

export class Config {
  dirPurgeAge = 15 * 60 * 1000;
  dirPurgeInterval = 60 * 1000;
  fileWatcherDelay = 250;
  maxFSLogEntries = 500;
  maxRedoStackSize = 100;
  maxUndoStackSize = 100;
  prepareNewNameDelay = 100;
  setBoundsDelay = 250;
  treeRefreshDelay = 100;
}

export const config = new Config();

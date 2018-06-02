/**
 * Common configuration settings
 */

export class Config {
  dirPurgeAge = 15 * 60 * 1000;
  dirPurgeInterval = 60 * 1000;
  fileWatcherThrottle = 250;
  maxFSLogEntries = 500;
  maxRedoStackSize = 100;
  maxUndoStackSize = 100;
  prepareNewNameDelay = 100;
  setBoundsDelay = 250;
  treeRefreshThrottle = 10;
}

export const config = new Config();

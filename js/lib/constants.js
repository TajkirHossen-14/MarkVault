// @ts-check
export const shortcuts = [
  { keys: '⌘ / Ctrl K', label: 'Open command palette', action: 'palette' }, { keys: '/', label: 'Search your vault', action: 'search' }, { keys: 'N', label: 'Save a new bookmark', action: 'add' }, { keys: 'J / K', label: 'Move between bookmarks', action: 'navigate' }, { keys: 'Enter', label: 'Open selected link', action: 'open' }, { keys: 'F', label: 'Toggle favorite', action: 'favorite' }, { keys: 'E', label: 'Edit bookmark', action: 'edit' }, { keys: 'Delete', label: 'Move to Trash', action: 'trash' }, { keys: 'G then A / U / F / T', label: 'All / Unread / Favorites / Trash', action: 'goto' }, { keys: '?', label: 'Show keyboard shortcuts', action: 'shortcuts' }
];
export const views = [ ['all','All bookmarks','bookmark'], ['unread','Unread','inbox'], ['favorites','Favorites','star'], ['recent','Recently added','clock'], ['unreachable','Unreachable','cloudOff'], ['trash','Trash','trash'] ];

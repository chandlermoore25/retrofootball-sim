export function exportRecentJSON(events: any[], label = 'replay') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const name = `${label}_${stamp}.json`;
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  saveAs(blob, name);
}

// Tiny helper that works without third-party deps
export function saveAs(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

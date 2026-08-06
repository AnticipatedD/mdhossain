function switchVendor(vendor) {
  // Hide all panels
  document.querySelectorAll('.vendor-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${vendor}`).classList.add('active');

  // Update tab styles
  document.querySelectorAll('.vendor-tab').forEach(t => {
    t.classList.remove('active-ibm', 'active-ms');
  });
  if (vendor === 'ibm') {
    document.getElementById('tab-ibm').classList.add('active-ibm');
  } else {
    document.getElementById('tab-ms').classList.add('active-ms');
  }
}

function filterLevel(level, btn, vendor) {
  // Update active button
  const menu = btn.parentElement;
  menu.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'ms-theme'));
  btn.classList.add('active');
  if (vendor === 'ms') btn.classList.add('ms-theme');

  // Filter rows
  const rows = document.querySelectorAll(`#panel-${vendor} .cred-row`);
  rows.forEach(row => {
    if (level === 'all' || row.dataset.level === level) {
      row.classList.remove('hidden');
    } else {
      row.classList.add('hidden');
    }
  });
}

const API_URL = '/bfhl';

async function handleSubmit() {
  const btn = document.getElementById('submitBtn');
  const raw = document.getElementById('inputArea').value.trim();
  if (!raw) {
    showError('Please enter at least one edge');
    return;
  }

  let data;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.data && Array.isArray(parsed.data)) {
      data = parsed.data;
    } else {
      throw new Error('no data array');
    }
  } catch {
    data = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  }

  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  hideMessages();
  document.getElementById('output').style.display = 'none';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `Server error ${res.status}`);

    document.getElementById('responseJson').textContent = JSON.stringify(json, null, 2);
    updateStats(json);
    document.getElementById('output').style.display = 'block';
    showSuccess('Analysis complete');

  } catch (err) {
    showError(err.message || 'API call failed.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyze';
  }
}

function clearInput() {
  document.getElementById('inputArea').value = '';
  document.getElementById('inputArea').focus();
  hideMessages();
  document.getElementById('output').style.display = 'none';
}

function showError(msg) {
  const errorEl = document.getElementById('errorMsg');
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
  document.getElementById('successMsg').style.display = 'none';
}

function showSuccess(msg) {
  const successEl = document.getElementById('successMsg');
  successEl.textContent = msg;
  successEl.style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';
}

function hideMessages() {
  document.getElementById('errorMsg').style.display = 'none';
  document.getElementById('successMsg').style.display = 'none';
}

function copyOutput() {
  const json = document.getElementById('responseJson').textContent;
  navigator.clipboard.writeText(json).then(() => {
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = original;
    }, 2000);
  });
}

function updateStats(json) {
  const stats = json.summary || {};
  const statsPanel = document.getElementById('statsPanel');
  
  statsPanel.innerHTML = `
    <div class="stat-item">
      <div class="stat-label">Total Trees</div>
      <div class="stat-value">${stats.total_trees || 0}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Cycles Found</div>
      <div class="stat-value">${stats.total_cycles || 0}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Invalid Entries</div>
      <div class="stat-value">${json.invalid_entries?.length || 0}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Duplicates</div>
      <div class="stat-value">${json.duplicate_edges?.length || 0}</div>
    </div>
  `;
}

document.getElementById('inputArea').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
});

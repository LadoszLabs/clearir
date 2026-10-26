'use strict';
(() => {
  const comparison = document.querySelector('.comparison');
  const range = document.querySelector('#comparison-range');
  const comparedImage = document.querySelector('#comparison-image');
  const comparedLabel = document.querySelector('#comparison-label');
  const tabs = [...document.querySelectorAll('.comparison-tabs button')];
  function setComparisonPosition() {
    comparison.style.setProperty('--position', `${range.value}%`);
    range.setAttribute('aria-valuetext', `${range.value} percent ${comparedLabel.textContent}, ${100 - Number(range.value)} percent CLEAR-IR`);
  }
  range.addEventListener('input', setComparisonPosition);
  for (const button of tabs) {
    button.addEventListener('click', () => {
      for (const tab of tabs) {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', String(active));
      }
      comparedImage.src = `assets/images/${button.dataset.image}`;
      comparedImage.alt = `${button.dataset.label} view of the evaluation scene, compared against the CLEAR-IR reconstruction.`;
      comparedLabel.textContent = button.dataset.label;
      range.setAttribute('aria-label', `Compare ${button.dataset.label} against CLEAR-IR`);
      setComparisonPosition();
    });
  }
  const rows = [
    {name:'Retinex', ll:[['0.064','0.02'],['0.163','0.05'],['0.168','0.05']], ell:null, latency:['73.43','10.54']},
    {name:'CLAHE', ll:[['0.069','0.03'],['0.156','0.05'],['0.169','0.05']], ell:null, latency:['15.16','3.09']},
    {name:'Zero-DCE', ll:[['0.065','0.02'],['0.147','0.05'],['0.190','0.05']], ell:null, latency:['46.35','2.32']},
    {name:'LLFormer', ll:[['0.067','0.03'],['0.156','0.05'],['0.183','0.05']], ell:null, latency:['236.88','10.20']},
    {name:'CIDNet', ll:[['0.069','0.03'],['0.560','0.22'],['0.178','0.05']], ell:null, latency:['76.33','0.86']},
    {name:'Raw IR', ll:null, ell:null, latency:null},
    {name:'U-Net', ll:[['0.072','0.03'],['0.161','0.06'],['0.164','0.06']], ell:[['0.097','0.05'],['0.167','0.05'],['0.168','0.06']], latency:['49.93','3.42']},
    {name:'CLEAR-IR', ll:[['0.070','0.03'],['0.164','0.06'],['0.137','0.07']], ell:[['0.092','0.04'],['0.159','0.05'],['0.159','0.12']], latency:['46.75','3.48']}
  ];
  const body = document.querySelector('#benchmark-body');
  const lightingButtons = [...document.querySelectorAll('[data-lighting]')];
  const note = document.querySelector('#lighting-note');
  function numberCell(value) {
    const cell = document.createElement('td');
    if (value) {
      cell.append(document.createTextNode(value[0]));
      const uncertainty = document.createElement('span');
      uncertainty.className = 'uncertainty';
      uncertainty.textContent = ` ± ${value[1]}`;
      cell.append(uncertainty);
    } else {
      const label = document.createElement('abbr');
      label.className = 'dni'; label.title = 'Did not initialise'; label.textContent = 'DNI';
      cell.append(label);
    }
    return cell;
  }
  function showLighting(mode) {
    body.replaceChildren();
    for (const data of rows) {
      const row = document.createElement('tr');
      if (data.name === 'CLEAR-IR') row.className = 'ours-row';
      const method = document.createElement('th'); method.scope = 'row'; method.textContent = data.name;
      row.append(method);
      for (const value of data[mode] || [null,null,null]) row.append(numberCell(value));
      row.append(numberCell(data.latency)); body.append(row);
    }
    for (const button of lightingButtons) {
      const active = button.dataset.lighting === mode;
      button.classList.toggle('active', active);button.setAttribute('aria-pressed', String(active));
    }
    const extreme = mode === 'ell';
    document.querySelector('table caption').textContent = `Table II, ${extreme ? 'extreme low light' : 'low light'}. RMSE in metres and mean model inference in milliseconds.`;
    note.textContent = extreme
      ? 'Extreme low light: RGB enhancement baselines fail to initialise; reconstructed IR supports SLAM across all three sequences.'
      : 'Low light: RGB enhancement remains competitive; CLEAR-IR reports the lowest SQ2 RMSE among the evaluated methods.';
  }
  for (const button of lightingButtons) button.addEventListener('click', () => showLighting(button.dataset.lighting));
  showLighting('ell');
  const copy = document.querySelector('#copy-citation');
  copy.addEventListener('click', async () => {
    const text = document.querySelector('#bibtex').textContent;
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'BibTeX copied to clipboard.';
      copy.textContent = 'Copied ✓';
      window.setTimeout(() => { copy.textContent = 'Copy BibTeX ⧉'; }, 2200);
    } catch {
      const selection = window.getSelection(); const range = document.createRange();
      range.selectNodeContents(document.querySelector('#bibtex'));selection.removeAllRanges();selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C (or ⌘C) to copy, or download the .bib file below.';
    }
  });
})();

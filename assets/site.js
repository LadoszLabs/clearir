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
  let lighting = 'ell';
  function showLighting(mode) {
    lighting = mode;
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
    showResultChart();
  }
  for (const button of lightingButtons) button.addEventListener('click', () => showLighting(button.dataset.lighting));
  const sequenceNames = ['Forward–backward', 'Square, one lap', 'Square, two laps'];
  const sequenceSelect = document.querySelector('#result-sequence');
  function showResultChart() {
    const sequence = Number(sequenceSelect.value);
    const bars = document.querySelector('#result-bars');
    const maximum = Math.max(...rows.filter(row => row[lighting]).map(row => Number(row[lighting][sequence][0])));
    bars.replaceChildren();
    document.querySelector('#chart-title').textContent = `${lighting === 'ell' ? 'Extreme low light' : 'Low light'} · ${sequenceNames[sequence]}`;
    for (const data of rows) {
      const item = document.createElement('div');
      item.className = `result-bar-row${data.name === 'CLEAR-IR' ? ' result-ours' : ''}`;
      item.setAttribute('role', 'listitem');
      const name = document.createElement('span'); name.className = 'bar-name'; name.textContent = data.name;
      const track = document.createElement('span'); track.className = 'bar-track';track.setAttribute('aria-hidden','true');
      const value = data[lighting]?.[sequence];
      if (value) {
        const fill = document.createElement('span'); fill.className = 'bar-fill'; fill.style.width = `${Number(value[0]) / maximum * 100}%`;track.append(fill);
      } else { track.classList.add('no-trajectory'); }
      const label = document.createElement('span');label.className = 'bar-value';label.textContent = value ? `${value[0]} ± ${value[1]} m` : 'Did not initialise';
      item.append(name,track,label);bars.append(item);
    }
    const ours = Number(rows.at(-1)[lighting][sequence][0]);
    const unet = Number(rows.at(-2)[lighting][sequence][0]);
    const improvement = (1 - ours / unet) * 100;
    const comparison = improvement > 0
      ? `${improvement.toFixed(1)}% lower mean RMSE than U-Net on this sequence.`
      : `${Math.abs(improvement).toFixed(1)}% higher mean RMSE than U-Net on this sequence.`;
    document.querySelector('#result-insight').textContent = lighting === 'ell'
      ? `CLEAR-IR: ${ours.toFixed(3)} m mean RMSE. ${comparison} All five evaluated RGB enhancement baselines did not initialise in extreme low light.`
      : `CLEAR-IR: ${ours.toFixed(3)} m mean RMSE. ${comparison} RGB enhancement remains competitive in low light.`;
  }
  sequenceSelect.addEventListener('change', showResultChart);
  showLighting('ell');
  const copy = document.querySelector('#copy-citation');
  copy.addEventListener('click', async () => {
    const text = document.querySelector('#bibtex').textContent;
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'BibTeX copied to clipboard.';
      copy.textContent = 'Copied';
      window.setTimeout(() => { copy.textContent = 'Copy BibTeX'; }, 2200);
    } catch {
      const selection = window.getSelection(); const range = document.createRange();
      range.selectNodeContents(document.querySelector('#bibtex'));selection.removeAllRanges();selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C (or ⌘C) to copy, or download the .bib file below.';
    }
  });

  const video = document.querySelector('#research-video');
  const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
  let pendingChapter = null;
  function seekVideo() {
    if (pendingChapter !== null && video.readyState >= 1) {
      video.currentTime = pendingChapter; pendingChapter = null;
      video.play().catch(() => { document.querySelector('#video-status').textContent = 'Chapter selected. Use the video play button to start playback.'; });
    }
  }
  video.addEventListener('loadedmetadata', seekVideo);
  for (const button of chapterButtons) {
    button.addEventListener('click', () => {
      pendingChapter = Number(button.dataset.chapter);
      if (video.readyState >= 1) seekVideo(); else { video.preload = 'metadata'; video.load(); }
      document.querySelector('#video-status').textContent = `Selected ${button.textContent.trim()}.`;
    });
  }
  video.addEventListener('timeupdate', () => {
    const active = chapterButtons.findLast(button => video.currentTime >= Number(button.dataset.chapter));
    for (const button of chapterButtons) {
      button.classList.toggle('active', button === active);
      if (button === active) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
    }
  });

  const tasks = {
    markers: { kicker:'Readable markers', title:'Recover the marker’s grid.', description:'Emitter dots interrupt the black-and-white pattern of standard ArUco markers. Reconstruction makes those boundaries readable without specialised reflective tags.', metric:'0/6 → 6/6', label:'ArUco markers detected, raw IR → CLEAR-IR', caveat:'Counts from the evaluated example in Table I; not a dataset-wide detection rate.', source:'S4.SS2', link:'Read the marker experiment ↗', before:'ir_aruco.png', after:'denoised_deepmao_ir_aruco.png', beforeLabel:'Raw IR · 0/6 markers', afterLabel:'CLEAR-IR · 6/6 markers', beforeAlt:'Raw IR image with no ArUco markers detected.', afterAlt:'CLEAR-IR image with six ArUco markers detected.' },
    objects: { kicker:'Reuse pretrained vision', title:'Expose shapes the detector can use.', description:'Reconstructed IR supports a pretrained YOLOv26 detection and segmentation model without IR-specific fine-tuning. The video shows how detections persist as the camera moves.', metric:'11 detections', label:'Table I reports 11 CLEAR-IR detections and 2 mislabelled objects', caveat:'Table I reports 11 detections and 2 mislabels for CLEAR-IR, versus 0 detections and 1 mislabel for raw IR. These are example counts, not detection accuracy or mAP.', source:'S4.SS1', link:'Read the object experiment ↗', before:'detected_objects_ir_original.png', after:'deepmao_ir1_00135_1059ms.png', beforeLabel:'YOLOv26 · raw IR', afterLabel:'YOLOv26 · CLEAR-IR', beforeAlt:'YOLOv26 output on patterned raw IR.', afterAlt:'YOLOv26 detections and segmentation after CLEAR-IR reconstruction.' },
    tracking: { kicker:'Localisation in darkness', title:'Give SLAM a stable scene to track.', description:'CLEAR-IR feeds reconstructed IR and measured depth to a modified ORB-SLAM3 pipeline with SuperPoint features. It produces trajectories in each of the three evaluated extreme-low-light sequences.', metric:'3/3 sequences', label:'Extreme-low-light sequences with reported CLEAR-IR trajectories', caveat:'Table II: raw IR and all five RGB enhancement baselines did not initialise in extreme low light. U-Net also produced trajectories in all three sequences. Explore mean errors below.', source:'S4.SS3', link:'Read the SLAM experiment ↗' }
  };
  const taskTabs = [...document.querySelectorAll('[data-task]')];
  function selectTask(button) {
    const data = tasks[button.dataset.task];
    for (const tab of taskTabs) { const active = tab === button;tab.setAttribute('aria-selected',String(active));tab.tabIndex = active ? 0 : -1; }
    document.querySelector('#task-panel').setAttribute('aria-labelledby',button.id);
    for (const [id, key] of Object.entries({'task-kicker':'kicker','task-title':'title','task-description':'description','task-metric':'metric','task-metric-label':'label','task-caveat':'caveat'})) document.getElementById(id).textContent = data[key];
    const source = document.querySelector('#task-source');source.href = `https://arxiv.org/html/2510.04883v2#${data.source}`;source.textContent = data.link;
    const tracking = button.dataset.task === 'tracking';
    document.querySelector('#task-visual .image-pair').hidden = tracking;
    document.querySelector('#task-trajectory').hidden = !tracking;
    if (!tracking) {
      for (const side of ['before','after']) {
        const img = document.querySelector(`#task-${side}`);img.src = `assets/images/${data[side]}`;img.alt = data[`${side}Alt`];
        document.querySelector(`#task-${side}-label`).textContent = data[`${side}Label`];
      }
    }
  }
  for (const tab of taskTabs) {
    tab.addEventListener('click', () => selectTask(tab));
    tab.addEventListener('keydown', event => {
      const index = taskTabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? (index + 1) % taskTabs.length : event.key === 'ArrowLeft' ? (index + taskTabs.length - 1) % taskTabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? taskTabs.length - 1 : null;
      if (next !== null) { event.preventDefault();taskTabs[next].focus();selectTask(taskTabs[next]); }
    });
  }

  const runControls = ['run-lighting','run-sequence','run-mode','run-smoke'].map(id => document.getElementById(id));
  function buildCommand() {
    const [light, sequence, mode, smoke] = runControls;
    const directories = { dark:['ros_forward_backward','ros_square_1_lap','ros_square_2_lap'], dim:['forward_backward','square_1lap','square_2lap'] };
    const path = `${light.value}/${directories[light.value][Number(sequence.value)]}`;
    const dataset = `data/CLEARIR_rosbags/${path}`;
    const slash = String.fromCharCode(92);
    document.querySelector('#run-command').textContent = [
      '# Clone the dataset once, then download this sequence',
      'mkdir -p data',
      'GIT_LFS_SKIP_SMUDGE=1 git clone '+slash,
      '  https://github.com/nathanshankar/CLEARIR_rosbags.git data/CLEARIR_rosbags',
      `git -C data/CLEARIR_rosbags lfs pull --include='${path}/**'`,
      '',
      'python3 -m darkslam.evaluate '+slash,
      `  --dataset ${dataset} ${slash}`,
      '  --settings configs/clearir.yaml '+slash,
      `  --groundtruth ${dataset}/vicon.csv ${slash}`,
      `  --mode ${mode.value} --device auto --plot${smoke.checked ? ' --max-frames 120' : ''} ${slash}`,
      `  --output results/${light.value}_${['fb','sq1','sq2'][Number(sequence.value)]}_${mode.value}${smoke.checked ? '_smoke' : ''}`
    ].join('\n');
    document.querySelector('#command-status').textContent = '';
  }
  runControls.forEach(control => control.addEventListener('change',buildCommand));buildCommand();
  document.querySelector('#copy-command').addEventListener('click', async () => {
    const code = document.querySelector('#run-command');
    try { await navigator.clipboard.writeText(code.textContent);document.querySelector('#command-status').textContent = 'Commands copied. Run them from the DarkSLAM repository root.'; }
    catch { const range = document.createRange();range.selectNodeContents(code);const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);document.querySelector('#command-status').textContent = 'Commands selected. Use your system copy shortcut to copy them.'; }
  });
})();

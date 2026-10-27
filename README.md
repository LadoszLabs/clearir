# CLEAR-IR project page

Academic project website for **CLEAR-IR: Clarity-Enhanced Active Reconstruction of Infrared Imagery for low-light enhancement**, arXiv:2510.04883v2.

- Website: https://ladoszlabs.github.io/clearir/
- Paper: https://arxiv.org/html/2510.04883v2
- Code and pretrained model: https://github.com/nathanshankar/DarkSLAM
- Dataset: https://github.com/nathanshankar/CLEARIR_rosbags
- IROS video: [watch or download](assets/media/clearir-iros-2026.mp4)

Authors and content follow the version-2 PDF/HTML: Nathan Shankar, Marton Gonczy, Hujun Yin, and Pawel Ladosz, The University of Manchester. The arXiv abstract-page metadata differs from the version-2 document; this site follows the document itself.

## Preview

No build, dependencies, or framework is required.

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/. Video chapter seeking requires a server with HTTP byte-range support, as provided by GitHub Pages; the simple Python server is suitable for layout previews. All fonts, illustrations, and images are served locally. External links point to the paper, dataset, authors, and lab. There are no analytics or trackers.

## Edit

- `index.html`: narrative, authors, links, figures, and citation.
- `assets/style.css`: responsive layout and typography.
- `assets/site.js`: image comparison, accessible application tabs, chapter seeking, interactive RMSE bars and lighting-condition table, evaluation command builder, clipboard interactions.
- `assets/architecture.svg`: editable schematic of the reconstruction network.
- `assets/paper-data.json`: versioned paper metadata and abstract.
- `citation.bib`: downloadable citation.
- `assets/media/`: author-supplied IROS video and a poster frame. The MP4 is remuxed for progressive playback without re-encoding; no autoplay or third-party video embeds. Chapter times are navigation aids. The surrounding text describes its visual content.

Reported numerical results are transcribed from Tables I and II, not from development runs of the SLAM implementation. Enhancement latency is distinguished from complete SLAM runtime. Task counts refer to the examples in Table I, rather than aggregate accuracy. RMSE reductions compare reported means against U-Net and do not imply statistical significance. Did-not-initialise entries remain distinct from zero error. The command builder follows the public repository dataset paths and uses Vicon ground truth with fixed-scale SE(3) alignment. Installation and build instructions remain in the code repository.

The comparison uses the fixed images from Figure 3; it does not perform inference in the browser.

## GitHub Pages

The `LadoszLabs/clearir` public repository is published from the root of `main` using GitHub Pages. `.nojekyll` serves the plain HTML/CSS/JS files directly. Push updates to `main` to publish them. Relative asset paths allow hosting at `/clearir/` without a build-time base-path setting.

If Pages needs configuring again:

```bash
gh api --method POST repos/LadoszLabs/clearir/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

For an existing Pages configuration use `--method PUT` instead.

## Sources and attribution

Paper text, figures, results, and authorship are from the author's [version-2 paper](https://arxiv.org/html/2510.04883v2). `assets/image-sources.json` records the source URL of each downloaded figure. Paper media retain their original rights and attribution. The network schematic and website implementation were authored for this project; the architecture schematic is illustrative rather than an exact layer-by-layer drawing.

The visual direction takes inspiration from academic project pages, including [Beyond Frontiers](https://beyondfrontiers.github.io/); no source code or research content from that project is copied. Manrope and DM Sans are self-hosted Google Fonts under the bundled SIL Open Font Licenses in `assets/fonts/`.

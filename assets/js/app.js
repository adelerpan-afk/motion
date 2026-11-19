(() => {
  'use strict';

  const LIBRARY = window.PROMPT_LIBRARY;
  const REFERENCES = window.PROMPT_REFERENCES;
  const STYLES = LIBRARY?.styles || [];
  const FAMILIES = LIBRARY?.families || [];
  const $ = (id) => document.getElementById(id);

  if (!LIBRARY || !REFERENCES || !STYLES.length) {
    document.body.innerHTML = '<main><section class="panel"><h1>Library tidak dapat dimuat</h1><p>Pastikan data/references.js dan data/styles.js berada di lokasi yang benar.</p></section></main>';
    return;
  }

  let manuallySelectedReferenceMode = false;
  let previousStyleName = null;

  const LOW_POLY_CONTRACT = `LOW-POLY VISUAL CONTRACT (COMPACT)
- Geometry: triangulated low-poly surfaces, flat normals/flatShading, one stable vertex color per triangular facet, subtle seeded neighbor variation. Preserve readable silhouettes; no dense subdivision, photo textures, or automatic black wireframe.
- Main material: MeshStandardMaterial, vertexColors:true, flatShading:true, roughness:0.9, metalness:0. Water may use roughness 0.30–0.35; small droplets may use roughness around 0.4. Keep surfaces matte, not glossy plastic.
- Palette: controlled family of teal water, sage/forest greens, sand, cream, coral accents, violet-leaning rock shadows, and peach haze. Do not randomize outside the palette.
- Lighting: one dominant low-angle warm directional sun (source reference: #ffe0ba, power 3.5, size 15, soft 2.2, shadow map 4096, normalBias 0.03), cool blue sky fill (#a9c9ff, power 0.9), peach atmospheric fog. Use one clear key-light direction; avoid many competing key lights. Fit shadow-camera bounds to the scene before increasing map resolution.
- Camera/focus: source FOV 30°, neutral tone mapping, exposure 1.0. Keep hero subject, important facets and all text sharp. Use shallow DOF only for distant background; starting aperture 0–0.04 world units for explainer compositions (source sample uses 0.05–0.06). Avoid excessive motion blur, bloom washout, vignette and grain.
- Render baseline from source: samples 64, shutter 0.4, bloom 0.35, bloomThreshold 1.25, vignette 0.22, grain 0.014. Separate preview from export: preview 4–8 samples; export 16–32; 64 only for deliberate high-quality accumulation.
- Style intent: miniature cut-paper / cut-stone world; facet planes must remain legible through geometry, normals, directional lighting and restrained color variation. Do not simplify every object into cubes or pyramids.
- Content adaptation: the original Low-Poly source is a water-cycle sample, not a mandatory story. Replace its sample landscape, objects, actions, labels, timing, and camera path with visuals derived from the user's actual narration. Reuse only useful geometry/material/rendering techniques.

LOW-POLY TIMELINE CONTRACT
- The sample source's 8.5-second T.end and all sample event times are examples only. They are NOT project limits and must never cap the final duration.
- Define one PROJECT.duration from the selected target duration. If SRT exists, preserve its timestamps and use the final subtitle end as the minimum narration end; otherwise derive beats from sentence/paragraph boundaries and fit them to the selected duration. For 'follow voiceover', derive duration from SRT or estimate the spoken duration; do not fall back to 8.5 or 12 seconds.
- Build a beat timeline [{id,start,end,text,visualAction}] in absolute seconds. Map all scene events, camera keys, object reveals, transitions, and Sound Kit cues to beat boundaries. Use proportional/normalized timing only when there are no usable timestamps.
- Set style.duration and stage duration to PROJECT.duration. Every keyframe/event must be within [0, PROJECT.duration]. End on the final beat and hold the conclusion briefly.
- All animation must be deterministic and seekable: update/seek functions derive state from absolute t, never accumulated delta time. S.seek(t) must return the same frame for the same t, regardless of request order.

LOW-POLY FLAG CONFIGURATION
Use one configuration array named FLAG_SPECS. Each item: {num, word, at:[x,z], yaw, height, side, t0}. Set height to the UI default (${ $('flagHeight')?.value || '1.30' } scene units) unless overridden per flag. Derive word from a concise label in the narration and t0 from the matching beat start. Choose positions from actual scene layout. Create only useful markers, not automatically one per beat. Support any reasonable number of flags; do not assume four. Refactor flag creation, animation and sound cues to iterate over FLAG_SPECS. Do not keep a separate STEPS/FLAGS/FLAG_T system.`;

  const MEDIABUNNY_SPEC = `MP4 EXPORT IMPLEMENTATION — MEDIABUNNY
Use Mediabunny 1.66.0 (pin the version) from the ESM CDN inside the generated standalone HTML:
import * as Mediabunny from 'https://cdn.jsdelivr.net/npm/mediabunny@1.66.0/+esm';
Use real MP4 muxing; never record WebM and rename its extension.

Required flow:
1. Show an Export MP4 modal before rendering.
2. Settings: resolution 1280×720, 1920×1080 (default), 2560×1440, 3840×2160, Custom width/height; FPS 24/25/30/50/60 (default 30); quality Standard/High/Very High (default High); filename; Include Sound Kit (on by default); Include Narration (on only when a narration file is loaded). Respect selected aspect ratio. Validate positive, even custom dimensions and a supported frame rate.
3. Resize the renderer to the selected output dimensions, set pixel ratio 1, update camera aspect/projection, and render directly at output resolution.
4. Before export, create Mp4OutputFormat and detect encodable codecs using getFirstEncodableVideoCodec(format.getSupportedVideoCodecs(), {width,height,...}) and getFirstEncodableAudioCodec(format.getSupportedAudioCodecs()). Prefer AVC ('avc') for video and AAC ('aac') for audio. If no compatible codec exists, show an actionable error; do not silently switch container/extension.
5. Use Output + CanvasSource for video. Add all tracks before output.start(). Use a quality preset through new Quality('high') (or selected quality) or a validated bitrate. Await every CanvasSource.add(timestamp,duration) to respect encoder/writer backpressure.
6. totalFrames = Math.ceil(PROJECT.duration * fps). For each frameIndex: t=frameIndex/fps; call S.seek(t); ensure the renderer has completed the frame; await videoSource.add(t, Math.min(1/fps, PROJECT.duration-t)); update progress. Do not use setInterval or capture the real-time preview. Close each source when finished, then await output.finalize().
7. Audio: retain the existing Sound Kit code and per-style sound(k) cues. When enabled, render the Sound Kit deterministically for the whole project duration. SOUND.renderOffline returns interleaved float stereo data; convert it into a two-channel AudioBuffer. If narration is loaded and enabled, decode the original file and mix it with the Sound Kit in an OfflineAudioContext, ducking the Sound Kit under speech rather than deleting its music/ambience. Do not use voiceover:true if that option suppresses beds/music. Add one mixed AudioBuffer through AudioBufferSource with AAC, await add(), then close the source. Do not synthesize narration/TTS.
8. File writing: prefer showSaveFilePicker() + createWritable() and new StreamTarget(writable,{chunked:true}) with new Mp4OutputFormat({fastStart:false}). Keep bounded memory; never collect all video chunks in an array. StreamTarget handles WritableStream backpressure. Use BufferTarget/Blob download only as a clearly bounded fallback for estimated small exports (about 100 MB or less); warn when unavailable for larger files. Do not claim a folder write when the picker/API is unavailable.
9. Expose progress percentage and current frame/total frames; provide Cancel. On cancel call await output.cancel() and stop the render loop. On success await output.finalize(), close any remaining sources, and report the actual saved file. Handle picker cancellation separately from encoding errors.
10. Keep the export modal simple; advanced codec internals stay hidden. Add clear errors for unsupported codec, permission denial, memory-limited fallback, and render failure.

API shape (adapt to actual canvas/audio buffers; do not copy as a blind placeholder):
const format = new Mp4OutputFormat({ fastStart: false });
const target = new StreamTarget(writable, { chunked: true });
const output = new Output({ format, target });
const video = new CanvasSource(renderer.domElement, { codec: videoCodec, quality: new Quality('high'), latencyMode: 'quality' });
output.addVideoTrack(video);
// If audio is enabled:
const audio = new AudioBufferSource({ codec: audioCodec, bitrate: 160_000 });
output.addAudioTrack(audio);
await output.start();
// Sequentially call await video.add(timestamp, frameDuration) after S.seek(timestamp).
// Then await audio.add(mixedAudioBuffer); video.close(); audio.close(); await output.finalize();

Use StreamTarget chunked mode with awareness that its default chunk size is 16 MiB. fastStart:false minimizes memory; do not use fastStart:'in-memory' for long exports.`;

  const GENERAL_COMPACT_CONTRACT = `COMPACT THREE.JS IMPLEMENTATION CONTRACT
Create one complete HTML output. Use a deterministic scene API with one absolute project clock. The scene build method returns update(t); S.seek(t) applies all object, camera, material, particle, and overlay states for t. Clamp only to PROJECT.duration, not a preset sample duration. Keep rendering helpers modular and avoid unnecessary post-processing. Recreate only the selected style, not any unrelated presets.`;

  function formatSeconds(seconds) {
    const s = Math.max(0, Math.round(seconds));
    if (s < 60) return `${s} detik`;
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return rem ? `${mins} menit ${rem} detik` : `${mins} menit`;
  }

  function getDurationSpec() {
    const value = $('duration').value;
    if (value === 'voiceover') {
      return {
        label: 'Ikuti durasi voiceover',
        detail: 'Jika SRT tersedia, gunakan timestamp akhir sebagai durasi. Jika hanya naskah, estimasikan durasi bicara secara wajar dan gunakan keseluruhan naskah.',
        seconds: null,
      };
    }
    const seconds = value === 'custom'
      ? Number($('durationCustom').value)
      : Number(value);
    if (!Number.isFinite(seconds) || seconds < 1 || seconds > 36000) {
      return { label: 'Durasi custom tidak valid', detail: 'Minta nilai durasi yang valid antara 1 dan 36000 detik.', seconds: null };
    }
    return { label: `${formatSeconds(seconds)} (${seconds} detik)`, detail: `Gunakan tepat ${seconds} detik sebagai durasi proyek.`, seconds };
  }

  function current() {
    return STYLES.find((style) => style.name === $('style').value) || null;
  }

  function familyFor(style) {
    return FAMILIES.find((family) => family.id === style.family) || { name_id: style.family, description: '' };
  }

  function syncReferenceDefault(style) {
    if (!style) return;
    if (!manuallySelectedReferenceMode) {
      $('fullSourceReference').checked = style.name !== 'Low-Poly';
    }
    $('referenceModeHelp').textContent = style.name === 'Low-Poly' && !$('fullSourceReference').checked
      ? 'Compact aktif: Sound Kit asli tetap disertakan. Shared Stage Engine dan source Low-Poly lengkap diganti kontrak ringkas untuk menghemat token.'
      : 'Full Source aktif: shared Stage Engine, Sound Kit asli, dan source preset terpilih disertakan.';
  }

  function updateCard() {
    const style = current();
    if (!style) return;
    const family = familyFor(style);
    $('styleName').textContent = style.name;
    $('category').textContent = style.category;
    $('fileName').textContent = family.name_id || style.family;
    $('familyTitle').textContent = family.name_id || style.family;
    $('familyDescription').textContent = family.description || '';
    $('description').textContent = style.description;
    $('example').textContent = style.example;
    $('goodfor').textContent = style.good_for;
    $('lowPolyOptions').classList.toggle('hidden', style.name !== 'Low-Poly');
    $('subtitleOptions').classList.toggle('hidden', !$('subtitleEnabled').checked);
    syncReferenceDefault(style);
  }

  function buildFlagSpec() {
    const height = Number($('flagHeight').value);
    const defaultHeight = Number.isFinite(height) && height > 0 ? height : 1.3;
    return `LOW-POLY FLAG SPECS\nGunakan konfigurasi data berikut sebagai kontrak, lalu isi berdasarkan beat dan layout scene aktual. Jangan memakai contoh narasi atau koordinat tetap.\nconst FLAG_SPECS = [\n  // Tambahkan hanya marker lokasi/konsep yang membantu pemahaman.\n  // { num: 1, word: '[LABEL SINGKAT]', at: [x, z], yaw: 0, height: ${defaultHeight.toFixed(2)}, side: 1, t0: beat.start }\n];\nField: num=urutan; word=label ringkas; at=[x,z]=posisi scene; yaw=arah; height=tinggi tiang (default ${defaultHeight.toFixed(2)} unit, dapat dioverride); side=sisi papan; t0=detik kemunculan. Gunakan FLAG_SPECS sebagai satu-satunya sumber konfigurasi flag. Buat flag dinamis dengan FLAG_SPECS.map(...); hilangkan STEPS/FLAGS/FLAG_T terpisah dan jangan membatasi jumlah flag menjadi empat.`;
  }

  function buildSubtitleSpec() {
    if (!$('subtitleEnabled').checked) {
      return 'SUBTITLE OVERLAY: nonaktif; jangan menambahkan subtitle narasi. Teks yang memang menjadi bagian dari dunia visual boleh tetap ada bila sesuai gaya.';
    }
    return `SUBTITLE OVERLAY: aktif.\n- Jenis: ${$('subtitleType').value === 'word' ? 'per kata (karaoke), sinkronkan kata aktif dengan timing voiceover; hanya kata saat ini yang disorot' : 'standar, tampilkan frasa/baris utuh sesuai timing voiceover'}.\n- Posisi: ${$('subtitlePosition').value}; letakkan di area aman dan jangan menutupi subjek, label penting, atau aksi.\n- Tipografi: ${$('subtitleFont').value}, ukuran ${$('subtitleSize').value}px pada kanvas 1080p; warna ${$('subtitleColor').value}; sorot kata aktif ${$('subtitleHighlight').value}.\n- Latar: ${$('subtitleBackground').selectedOptions[0].textContent}; animasi masuk: ${$('subtitleAnimation').value}.\n- Pastikan keterbacaan, kontras, responsif pada rasio frame terpilih, dan hindari menampilkan kata sebelum waktunya.`;
  }

  function buildWorkflow() {
    if (!$('storyboardFirst').checked) {
      return 'STORYBOARD FIRST dimatikan: langsung bangun animasi final berdasarkan beat voiceover dan timeline.';
    }
    return `WORKFLOW STORYBOARD FIRST — WAJIB BERURUTAN:\nTahap 1: sebelum membangun animasi, buat storyboard visual dan tunggu persetujuan saya. Buat grid 3–6 panel atau lebih bila narasi panjang, satu keyframe untuk setiap beat penting. Tampilkan material, pencahayaan, komposisi, dan kamera yang mengikuti gaya terpilih. Render still satu per satu pada waktu absolut menggunakan S.seek(waktu).\nDi bawah tiap panel tulis nomor beat, waktu mulai/selesai, teks layar persis, aksi/perubahan, dan gerakan kamera. Catat asumsi fakta/angka bila ada. Setelah storyboard dikirim, BERHENTI dan tunggu persetujuan; jangan membuat animasi final. Setelah disetujui, bangun animasi final sesuai storyboard dan gunakan ulang aset/scene yang sudah disetujui.`;
  }

  function fullReferenceFor(style) {
    return `${REFERENCES.stageCore}${REFERENCES.soundKit}${style.source_reference || ''}`;
  }

  function compactReferenceFor(style) {
    const family = familyFor(style);
    const styleDigest = style.name === 'Low-Poly'
      ? LOW_POLY_CONTRACT
      : `SELECTED STYLE CONTRACT\nName: ${style.name}\nVisual description: ${style.description}\nUse: ${style.good_for}\nReference example: ${style.example}\nFamily: ${family.name_id}. ${family.description}\nPreserve the selected preset's defining visual properties; do not turn it into a generic 3D style.`;
    return `${GENERAL_COMPACT_CONTRACT}\n\n${styleDigest}\n\nSOUND KIT CONTRACT\nUse the supplied shared Sound Kit implementation below, keep its API intact, and create a style-specific sound(k) schedule from the actual narration beats. Preserve procedural music, ambience and sound effects. Do not create narration or TTS.\n\n${REFERENCES.soundKit}`;
  }

  function build() {
    const style = current();
    if (!style) {
      $('output').value = '';
      $('status').textContent = 'Tidak ada gaya yang cocok dengan pencarian.';
      return;
    }

    const topic = $('topic').value.trim() || '[TULIS TOPIK / KONTEN DI SINI]';
    const voice = $('voice').value.trim() || '[TEMPELKAN NASKAH VOICEOVER ATAU TIMING SRT DI SINI]';
    const family = familyFor(style);
    const camera = $('camera').value === 'custom'
      ? ($('cameraCustom').value.trim() || '[Isi gerakan kamera kustom]')
      : `${$('camera').selectedOptions[0].textContent} — ${$('camera').value}`;
    const duration = getDurationSpec();
    const isLowPoly = style.name === 'Low-Poly';
    const lowPolyFlagSpec = isLowPoly ? buildFlagSpec() : '';
    const workflow = buildWorkflow();
    const subtitleSpec = buildSubtitleSpec();
    const useFullSource = $('fullSourceReference').checked;
    const reference = useFullSource ? fullReferenceFor(style) : compactReferenceFor(style);
    const refMode = useFullSource ? 'FULL SOURCE REFERENCE' : 'COMPACT REFERENCE';

    const timelineSpec = `TIMELINE & DURATION\n- Target duration: ${duration.label}. ${duration.detail}\n- Frame rate default: 30 FPS unless export setting overrides it.\n- If SRT timestamps exist, preserve them. If only a plain script exists, segment it into coherent narration beats and distribute visuals across the full target duration.\n- Build one absolute timeline in seconds. Do not impose an 8.5-second, 12-second, or other preset ceiling.\n- The project duration controls scene.duration, S.duration, camera tracks, every animation event, sound cue, subtitle and export frame count. No key or cue may silently stop at a sample preset's old end time.\n- Avoid stretching every small motion over several minutes; distribute meaningful actions across narration beats while keeping each action's local motion natural.\n- All frame state must be deterministic from absolute time; S.seek(t) must work in any frame order.`;

    let prompt = `Create a polished 3D motion-graphics animation in Three.js using the selected visual style: “${style.name}”. The animation must follow the narration timeline below.\n\nDELIVERABLE\nReturn exactly one complete standalone HTML file containing HTML, CSS and JavaScript. No local companion files. External browser libraries may be loaded from pinned CDN URLs when required.\n\nMAIN CONTENT\n${topic}\n\nNARRATION / TIMELINE\n${voice}\n\n${workflow}\n\n${subtitleSpec}\n\n${lowPolyFlagSpec}\n\n${timelineSpec}\n\nPRODUCTION SPECIFICATION\n- Aspect ratio: ${$('format').value}.\n- Camera direction: ${camera}.\n- Camera rules: one primary movement per beat, smooth easing, keep subjects and important text inside frame, avoid purposeless shake/rotation, and synchronize camera changes with narration.\n- Selected visual style: ${style.name}. ${style.description}\n- Suitable use: ${style.good_for}\n- Style family: ${family.name_id}. ${family.description}\n- Visual example is directional only; do not copy its sample subject: ${style.example}\n- Break narration into visually distinct beats. One main idea per beat; synchronize important actions with relevant words/phrases. End with a readable conclusion held briefly.\n- Use scene objects, material, lighting, camera, transitions and on-screen text that directly represent the user's topic. No unrelated sample narrative, labels, or objects.\n- Build Three.js scene, renderer, camera, lighting, geometry/materials, absolute-time animation, responsive resize, cleanup, and playback controls.\n- Use Three.js from a pinned CDN.\n- Preserve the Sound Kit. It is required and is separate from narration: include procedural music, ambience and designed sound effects through the supplied Sound Kit. Do not generate voiceover or TTS. Add a “Load Narasi” button for optional user-provided audio; when loaded, synchronize playback and scrubbing to audio.currentTime.\n- Provide play/pause, scrub, current time and duration. Without narration, use a deterministic standalone clock.\n- Keep all source code in the one HTML output; do not leave placeholders or pseudo-code.\n\n${MEDIABUNNY_SPEC}\n\nADDITIONAL INSTRUCTIONS\n${$('extra').value.trim() || 'None.'}\n\nREFERENCE MODE: ${refMode}\nThe reference material is guidance. Adapt it to the user's topic and timeline. Do not retain example subject matter or hard-coded sample event times.\n\n${reference}`;

    $('output').value = prompt;
    $('status').textContent = '';
  }

  function update() {
    updateCard();
    build();
  }

  function options(filter = '') {
    const select = $('style');
    const previous = select.value;
    const filtered = STYLES.filter((style) => {
      const family = familyFor(style);
      return `${style.name} ${style.category} ${style.good_for} ${family.name || family.name_id || ''}`
        .toLowerCase().includes(filter.toLowerCase());
    });

    select.innerHTML = '';
    if (!filtered.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Tidak ada gaya yang cocok';
      select.append(option);
      $('styleName').textContent = 'Tidak ditemukan';
      $('category').textContent = '';
      $('fileName').textContent = '';
      $('description').textContent = '';
      $('example').textContent = '';
      $('goodfor').textContent = '';
      $('familyTitle').textContent = '';
      $('familyDescription').textContent = '';
      $('output').value = '';
      $('status').textContent = 'Ubah kata pencarian untuk melihat preset lain.';
      return;
    }

    filtered.forEach((style) => {
      const option = document.createElement('option');
      option.value = style.name;
      option.textContent = `${style.name} · ${style.category}`;
      select.append(option);
    });
    if (filtered.some((style) => style.name === previous)) select.value = previous;
    else select.selectedIndex = 0;
    update();
  }

  $('count').textContent = `${STYLES.length} gaya visual`;
  $('style').addEventListener('change', () => {
    if (current()?.name !== previousStyleName && !manuallySelectedReferenceMode) {
      // Reference mode follows the preset default until the user explicitly changes the checkbox.
    }
    previousStyleName = current()?.name || null;
    update();
  });
  $('search').addEventListener('input', (event) => options(event.target.value));
  $('fullSourceReference').addEventListener('change', () => {
    manuallySelectedReferenceMode = true;
    build();
    syncReferenceDefault(current());
  });

  [
    'topic', 'voice', 'duration', 'durationCustom', 'format', 'camera', 'cameraCustom',
    'storyboardFirst', 'subtitleEnabled', 'subtitleType', 'subtitlePosition', 'subtitleFont',
    'subtitleSize', 'subtitleColor', 'subtitleHighlight', 'subtitleBackground',
    'subtitleAnimation', 'flagHeight', 'extra',
  ].forEach((id) => $(id).addEventListener('input', () => {
    if (id === 'duration') $('customDurationWrap').classList.toggle('hidden', $('duration').value !== 'custom');
    build();
  }));

  $('camera').addEventListener('change', () => {
    $('cameraCustom').classList.toggle('hidden', $('camera').value !== 'custom');
    build();
  });
  $('storyboardFirst').addEventListener('change', build);
  $('subtitleEnabled').addEventListener('change', () => { updateCard(); build(); });
  $('duration').addEventListener('change', () => {
    $('customDurationWrap').classList.toggle('hidden', $('duration').value !== 'custom');
    build();
  });

  $('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('output').value);
      $('status').textContent = 'Prompt berhasil disalin.';
    } catch (error) {
      $('output').select();
      document.execCommand('copy');
      $('status').textContent = 'Prompt disalin melalui fallback browser.';
    }
    window.setTimeout(() => { $('status').textContent = ''; }, 2500);
  });

  $('download').addEventListener('click', () => {
    const blob = new Blob([$('output').value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `prompt-${current()?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'motion'}.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  options();
  $('customDurationWrap').classList.toggle('hidden', $('duration').value !== 'custom');
})();

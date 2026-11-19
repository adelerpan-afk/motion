# Update Notes

## Low-Poly prompt pipeline
- Added a compact Low-Poly visual contract covering faceted geometry, matte materials, warm key light/cool fill, sharp subject focus, restrained DOF/bloom and the source render baseline.
- Added dynamic project duration support; source sample times and camera keyframes scale from `PROJECT_DURATION`.
- Normalized sample cloud/boat drift to project progress so longer durations do not push them continuously out of frame.
- Unified flag configuration around `FLAG_SPECS`; flag visuals and their sound cues use the same list.
- Added duration choices through 10 minutes and a custom duration field.

## Reference size
- Moved the shared Stage Engine and Sound Kit into `data/references.js`, stored once.
- Kept every preset's style-specific source in `data/styles.js`.
- Low-Poly defaults to Compact Reference: shared Sound Kit source remains included; shared Stage Engine and full Low-Poly source are omitted unless Full Source is enabled.
- Other presets default to Full Source to preserve their previous prompt behavior.

## Audio and MP4 prompt
- Removed the contradictory instruction that prohibited music and sound effects.
- Preserved the original procedural Sound Kit; narration/TTS is not generated.
- Added a pinned Mediabunny MP4 implementation contract: codec preflight, CanvasSource, AudioBufferSource, StreamTarget, modal settings, progress and cancellation.

## Validation
- JavaScript syntax checks passed for the app, style library, references library, and extracted Low-Poly source block.
- Runtime prompt test passed for Low-Poly Compact, 4-minute duration and Full Source mode.
- Verified all 35 non-Low-Poly preset references reconstruct byte-for-byte from the shared files plus their style-specific suffix.
- Browser visual QA could not be completed in this environment; no MP4 render was executed because this app generates prompts rather than rendering video.

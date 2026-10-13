# First Minds V1 Manual Playtest

Purpose: a 30–45 minute first-time-player and release-candidate check. Record observations; do not coach the tester beyond the prompts and do not invent feedback.

## Setup

- Use a signed production candidate on one supported iPhone and one representative Android phone. Add iPad portrait/landscape for the responsive pass.
- Remove the app first for the fresh-install run.
- Record build/version, OS/device, start/end time, seed, scenario, and any accessibility settings.
- Start offline once, then repeat update/network checks online if OTA is configured.

## A. First-time journey

1. Launch from a fresh install.
   - Expected: splash completes, onboarding appears once, no blank/error screen.
   - Ask: “What do you think this app lets you do?”
2. Complete onboarding without assistance.
   - Expected: controls are reachable, purpose and player role are understandable, Home appears.
3. Create a Stable Savannah world using a recorded seed and one changed environmental setting.
   - Expected: labels explain the setting; Create produces the selected world and does not duplicate on a double tap.
4. Observe Live Simulation at 1×, pause, inspect an agent, navigate back, then use 10× briefly.
   - Expected: no reset; identity remains stable; needs/traits/current behavior are real; back behavior is predictable.
5. Open Population, Social, Learning, and Timeline.
   - Expected: values agree with the same world; empty states explain that emergence requires time/opportunity; no fabricated event is shown.
6. Identify one significant event or discovery.
   - Ask: “What happened, and what evidence tells you why?”
7. Apply one supported environmental intervention.
   - Expected: timing/effect is explained and appears in history; outcome is not promised.
8. Create an alternate branch from a checkpoint and advance it separately.
   - Expected: branch identity is clear; switching restores each branch without cross-state leakage.
9. Pause and return Home.
   - Expected: current world summary and Continue Simulation are findable.
10. Force-quit the app, relaunch, and Continue.
    - Expected: same seed/branch/generation/population and individual/cultural/social state return; simulation remains intentionally paused until resumed.

## B. Recovery and lifecycle

1. While running, background for 30 seconds and foreground.
   - Expected: it was persisted and is paused; it does not advance or resume implicitly.
2. Repeat with a manual pause.
   - Expected: manual pause is preserved.
3. Terminate from the OS while paused; relaunch.
   - Expected: last durable checkpoint loads or an understandable recovery choice appears.
4. Use a prepared corrupt-copy fixture, never the only user save.
   - Expected: no silent overwrite; diagnostics/repair/reset choices are clear.
5. Switch and delete a non-active test branch.
   - Expected: confirmation and remaining histories are correct; active world is not lost.
6. Launch without network.
   - Expected: simulation, saves, and navigation work; update failure is nonfatal.

## C. Responsive and accessibility pass

- Phone: compact iPhone and representative Android, portrait.
- Tablet: iPad portrait and landscape.
- Inspect Home, onboarding, Create World, Live, Inspector, Population, Family Tree, Social, Learning/Cultural History, Timeline, Experiments, Histories, Settings.
- Check safe areas/cutouts, rotation, text clipping, scrolling, keyboard/search, dialogs, long names/IDs, touch targets, selection, empty/loading/error states.
- Enable the largest supported dynamic type; verify essential controls remain reachable.
- Navigate the full core flow with VoiceOver/TalkBack. Confirm names, roles, selected/disabled state, slider actions, chart alternatives, and focus order.
- Enable reduced motion and confirm meaning is not dependent on animation.
- Verify color is not the sole carrier of living/deceased, selected, positive/negative, or resource status.

## D. Playback smoke test

For a default-size world, observe 1× for two minutes, 10× for one minute, and 50× for 30 seconds.

Record:

- visible responsiveness and control latency;
- requested versus achieved speed/diagnostic backlog where available;
- frame drops, input stalls, thermal warnings, memory termination, and recovery;
- population at each sample.

Do not require sustained 50× after population growth beyond the validated range.

## Observation sheet

| Step | Device/build | PASS/PARTIAL/FAIL | What the player said/did | Reproduction/evidence | Severity |
| ---- | ------------ | ----------------- | ------------------------ | --------------------- | -------- |
|      |              |                   |                          |                       |          |

## Release-candidate success criteria

- No P0/P1 crash, data loss, inaccessible essential control, or misleading primary data.
- Fresh install and returning-user routing both work.
- Save/termination/resume and branch isolation succeed on iOS and Android.
- Android status-bar overlap is gone and tablet portrait/landscape remain usable.
- Accessibility defects do not prevent the complete core flow.
- Default population stays responsive at 1× and 10×; 50× degradation is communicated rather than corrupting outcomes.

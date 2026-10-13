# First Minds V1 Device and Lifecycle Test Results

Updated: 2026-10-12

## Evidence boundary

The checks below used Expo Go/development containers on simulators and an Android emulator. They
are useful UI evidence but are not substitutes for signed-candidate or physical-device testing.

| Target                        | Container          | Coverage                                                  | Result                                                                                           |
| ----------------------------- | ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Android `sdk_gphone16k_arm64` | Expo Go 57.0.9     | Live Simulation after safe-area change                    | PASS: world header begins below status bar; bottom navigation remains above system gesture area. |
| Android `sdk_gphone16k_arm64` | Expo Go 57.0.9     | Social Overview after safe-area change                    | PASS: eyebrow/title begin below status bar; no double top padding observed.                      |
| Android `sdk_gphone16k_arm64` | Expo Go 57.0.9     | Inspector, Population, Learning, onboarding, Create World | Previously observed functional and legible.                                                      |
| iPhone 17 Pro simulator       | Expo Go            | Onboarding                                                | Previously rendered without app-content clipping.                                                |
| iPad Pro 13-inch simulator    | Expo Go, portrait  | Home/current world                                        | Previously rendered responsive tablet composition.                                               |
| iPhone 17e simulator          | Expo Go            | Compact phone attempt                                     | Pending: Expo Go confirmation sheet blocked the prior headless pass.                             |
| iPad Pro 13-inch simulator    | Expo Go, landscape | Landscape attempt                                         | Pending: prior headless orientation control was unavailable.                                     |
| Physical iOS                  | Signed candidate   | Full matrix                                               | Not available; pending.                                                                          |
| Physical Android              | Signed candidate   | Full matrix                                               | Not available; pending.                                                                          |

Local screenshots retained outside the repository for the repaired Android routes:
`/tmp/first-minds-live-safe-area-fixed.png` and
`/tmp/first-minds-social-safe-area-fixed.png`.

## Lifecycle matrix

| Check                                    | Automated evidence                                                       | Signed candidate/device              | Status                    |
| ---------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ | ------------------------- |
| Fresh install and first launch           | Production export and bootstrap tests                                    | Not run                              | Pending                   |
| Onboarding and Create World              | Route/device-container evidence                                          | Not run                              | Partial                   |
| Run, pause, resume, speed change         | Controller tests                                                         | Not run                              | Partial                   |
| Background / foreground policy           | Tests prove background pauses/persists and foreground never auto-resumes | Not run                              | Partial                   |
| Save checkpoint / integrity              | Round-trip, hash, migration, corruption tests                            | Not run                              | Partial                   |
| Terminate / relaunch / Continue          | Persistence tests                                                        | Not run                              | Pending                   |
| Branch create / switch / delete          | Repository and integration tests                                         | Not run                              | Partial                   |
| Inspector / Social / Learning            | Adapter and route tests; development-container navigation                | Not run                              | Partial                   |
| Accelerated playback                     | Headless scheduler benchmark                                             | Not profiled on signed hardware      | Partial                   |
| Compatible OTA update                    | Update state/error tests; production channel configured                  | No OTA published by design           | Pending explicit approval |
| Offline startup / service unavailable    | Update failure is nonfatal in tests                                      | Airplane-mode candidate test not run | Partial                   |
| Upgrade from prior candidate             | Migration tests                                                          | Binary-to-binary upgrade not run     | Pending                   |
| VoiceOver/TalkBack/dynamic type/contrast | Code-level labels and reduced-motion support                             | Manual assistive-tech audit not run  | Pending                   |

Android signed build 5 completed and its AAB was inspected, but no signed production binary was
installed during this pass. Therefore cold launch, OS termination,
memory pressure, real update application, offline launch, thermal behavior, and physical
accessibility are not marked passed.

## Required completion pass

On both final signed candidates: fresh install; onboarding; create/run/pause/resume; background and
foreground; checkpoint; OS terminate; relaunch/continue; branch create/switch/delete; inspector,
Social and Learning navigation; 1×/10×/50× smoke; offline launch; unavailable-update service; and
diagnostic export. Repeat essential paths with VoiceOver/TalkBack and larger text. Record device,
OS, build number, runtime, channel, result, and screenshot/log evidence.

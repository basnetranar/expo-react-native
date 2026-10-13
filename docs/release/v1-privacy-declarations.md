# First Minds V1 Privacy and Store Declarations (Draft)

Prepared: 2026-10-12  
Publisher: Challenge Me Lab  
Status: accurate repository-derived draft; human and legal review required before submission.

## Product behavior and data map

First Minds is an offline-first, single-player simulation. It has no account creation, login,
advertising, purchases, public posting, multiplayer, user-to-user messaging, analytics SDK,
crash-reporting SDK, or cross-app tracking.

### Stored locally on the device

- Onboarding completion and local app preferences.
- Current-world identity and simulation metadata.
- Simulation checkpoints, histories, branches, interventions, and generated population state.
- Storage migration/health state and update status.

Checkpoint files are checksummed and stored in the app's private documents area; manifests
and small settings use AsyncStorage. The app does not upload simulation saves.

### Network activity

- EAS Update checks and downloads from the configured Expo update service.
- Network reachability observation through NetInfo.
- Development builds may contact Expo developer services; this is not a production gameplay
  feature.

The app does not send gameplay, profile, advertising, or analytics events to Challenge Me Lab.
When EAS Update is contacted, Expo and network infrastructure may process ordinary request
metadata such as IP address, device/network headers, app/runtime version, and update channel.
The publisher must reflect the final service agreement and retention terms in the hosted policy.

### Diagnostics and sharing

Diagnostics are generated locally and shared only after a user chooses Export. They can include
app version/build/environment, platform and OS version, device class, update runtime/ID/channel,
storage health, responsive-layout measurements, timestamp, and a captured error. They do not
include the simulation checkpoint or population contents. The OS share sheet determines the
recipient; Challenge Me Lab does not receive a report unless the user sends it.

### SDK and library inventory

Expo/React Native modules provide routing, updates, application/device metadata, file storage,
sharing, images, splash/status/system UI, and browser/linking behavior. AsyncStorage stores
small local records; NetInfo observes connectivity; Zustand stores local UI/preferences. No
Sentry, PostHog, Firebase Analytics, advertising SDK, social-login SDK, or payment SDK is present.

## Platform questionnaire draft

| Topic                         | Draft answer       | Qualification                                                                                                                                               |
| ----------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account required              | No                 | No identity or authentication flow exists.                                                                                                                  |
| Advertising                   | No                 | No ads or ad SDK.                                                                                                                                           |
| Tracking                      | No                 | No ATT request, advertising ID use, or cross-app profiling.                                                                                                 |
| Data sold                     | No                 | No sale mechanism.                                                                                                                                          |
| Gameplay/save data uploaded   | No                 | Saves remain in app-private local storage.                                                                                                                  |
| User-generated public content | No                 | No upload or public sharing feature.                                                                                                                        |
| Analytics/crash reporting     | No                 | Only local diagnostics with explicit user export.                                                                                                           |
| Data sharing                  | User-directed only | OS share sheet can export a diagnostic report to a destination chosen by the user.                                                                          |
| Data deletion                 | OS-level deletion  | Uninstall/clear-app-data removes local data. The in-app reset control is intentionally unavailable in this candidate and must not be advertised as working. |
| Network access                | Yes                | Required for optional OTA update checks/downloads; core simulation remains offline-first.                                                                   |
| Encryption                    | Exempt/system only | No proprietary cryptography; platform HTTPS only. Owner must confirm export-compliance answer.                                                              |

Final Apple App Privacy and Google Play Data Safety answers must be reviewed in each console
against the final signed binary and Expo's current service disclosures. This draft is not a
submitted declaration.

## Permissions

- Android `INTERNET`, `ACCESS_NETWORK_STATE`, and `ACCESS_WIFI_STATE`: EAS Update and connectivity
  state used for safe update behavior.
- Android `VIBRATE`: transitive React Native/Expo capability; the current app does not make a
  product promise around vibration.
- Legacy Android external-storage permissions are explicitly blocked. App data uses private app
  storage and does not require Photos/Media access.
- `SYSTEM_ALERT_WINDOW` appeared in the first signed AAB despite being unused and is now explicitly
  blocked. Verify its absence in the replacement AAB.
- No camera, microphone, contacts, location, notification, health, Bluetooth, or tracking
  permission is requested by product code.
- The final AAB also contains Android's internal dynamic-receiver protection and Play install
  referrer binding from dependencies. They are not dangerous runtime permissions; reconfirm their
  store disclosure treatment during final Google dependency/data-safety review.

## Age suitability draft

The simulation includes natural predation, death, survival pressure, and evolution, presented
without graphic gore, sexual content, gambling, chat, or purchases. A conservative educational
simulation/game rating should be selected from the live questionnaires; Challenge Me Lab must
complete the authoritative Apple and Google age-rating forms rather than copying a guessed rating.

## Privacy policy draft

### First Minds Privacy Policy

First Minds, published by Challenge Me Lab, is an offline-first simulation. We do not require an
account and do not include advertising, behavioral analytics, cross-app tracking, or public user
content. Your world, checkpoints, histories, settings, and progress are stored locally in the
app's private storage and are not uploaded to Challenge Me Lab.

The app may contact Expo's update service to check for and download compatible application
updates. That service and its network providers may process ordinary technical request data,
including IP address and app/runtime information, under their own terms. Core simulation play
does not require a Challenge Me Lab server account.

If you choose to export diagnostics, the app prepares a local report containing technical app,
device, update, storage-health, layout, timestamp, and error information. You choose where to
send it using the operating system share sheet. We receive it only if you send it to us.

You can remove locally stored data by uninstalling the app or clearing its app data through your
device settings. No server account exists to delete. Contact **[support email required]** for
privacy or support questions. Effective date: **[publication date required]**.

Before publication, replace both placeholders, have the policy reviewed, host it on a stable
HTTPS URL controlled by Challenge Me Lab, and enter that verified URL in both stores.

## Support page draft

**First Minds Support — Challenge Me Lab**

Include: current version, supported iOS/Android versions from the final binaries, how to create
and continue a world, pause/resume rules, checkpoint and branch guidance, offline behavior,
diagnostic export instructions, known high-population speed limits, troubleshooting, privacy
policy link, response expectations, and **[support email required]**. This content also needs a
stable verified HTTPS URL; no live support page was found or claimed.

# First Minds V1 Store Materials and Asset Checklist

Prepared: 2026-10-12  
Publisher: Challenge Me Lab

## Draft listing copy

**App name:** First Minds  
**Google Play short description:** Shape a living world and watch intelligence emerge across generations.  
**Apple promotional text:** Guide the environment, observe every life, and explore how inheritance, experience, and social learning shape an evolving population.  
**Keywords:** evolution,simulation,intelligence,learning,culture,ancestry,science,strategy  
**Category draft:** Games / Simulation, with Education as a secondary fit where supported. Owner review required.

### Full description

Shape the world. Watch intelligence emerge.

First Minds is a deterministic living-world simulation of early hominins adapting across
generations. Change environmental pressure—food, water, and predators—then observe how each
individual survives, learns, forms relationships, and passes inherited potential to descendants.

Inspect individual lives and family connections. Follow population and inherited-trait trends.
See learned behaviours spread through observation, practice, and social contact. Save checkpoints,
branch alternate histories, and compare how different environmental choices change the outcome.

You do not directly control individuals or edit their traits. First Minds is about observation,
experimentation, and emergence. The same seed and choices produce the same simulation result.

Features:

- A live deterministic savannah simulation.
- Individual, population, family, social, learning, and evolutionary views.
- Environmental experiments using supported food, water, and predator pressures.
- Local checkpoints and alternate-history branches.
- Offline-first play with no account, ads, or in-app purchases.

Performance note: accelerated playback depends on population size and device performance.

### V1 release notes

Welcome to First Minds V1. Create a savannah world, observe individuals across generations,
inspect inherited traits and lived experience, follow family and social connections, explore
cultural learning, apply environmental experiments, and compare alternate histories from saved
checkpoints.

## Asset inventory

- [x] 1024×1024 primary icon at `assets/branding/icon.png`.
- [x] Android adaptive foreground has real transparent margins and centered existing brand art.
- [x] Android adaptive background is configured as `#07131F`.
- [x] Splash artwork and background are configured.
- [x] Clean CNG resource generation succeeds; generated launcher assets preserve alpha.
- [x] Programmatic alpha audit: 1024×1024 RGBA, 917,061 transparent pixels, 131,515 nontransparent
      pixels, transparent corners, artwork bounds `(212,233)`–`(811,790)`.
- [x] Inspect signed AAB launcher resources: adaptive XML references the configured background and
      foreground; density foregrounds retain alpha.
- [ ] Inspect the installed icon under circle, squircle, rounded-square, and themed/monochrome
      launcher modes. A separate monochrome asset is not configured.
- [ ] Confirm iOS icon rendering from the signed archive.

## Screenshot shot list

Use only the final signed candidate and actual simulation data. Do not advertise unimplemented
discoveries or mechanics.

1. Home / Continue Simulation.
2. Live Simulation with environment and population visible.
3. Hominin Inspector showing inherited versus learned information.
4. Population Overview and deterministic trends.
5. Family Tree & Lineage.
6. Social Groups / relationships.
7. Learning / cultural history.
8. Experiments and Alternate Histories.

- [ ] Apple: at least one current required Dynamic Island iPhone screenshot and, because tablet
      support is enabled, at least one 13-inch iPad screenshot; PNG/JPEG without alpha. Capture a
      coherent portrait phone set and tablet set, up to the store limit.
- [ ] Google Play: phone screenshots plus at least four tablet/large-screen screenshots for the
      supported tablet listing; use current console-accepted dimensions/aspect ratios.
- [ ] Google Play feature graphic: 1024×500, JPEG or 24-bit PNG without alpha.
- [ ] Add concise accessible alt text where the console supports it.
- [ ] Ensure status bars, safe areas, copy, generations, and mechanics match the release build.

## Store declaration and operational checklist

- [ ] Human-review app name, descriptions, promotional text, keywords, category, and release notes.
- [ ] Supply a verified support email.
- [ ] Host and verify the support and privacy HTTPS URLs prepared in
      `v1-privacy-declarations.md`.
- [ ] Complete Apple App Privacy and Google Data Safety from the final binary/dependency inventory.
- [ ] Complete both age-rating questionnaires; do not reuse the nonauthoritative draft as a rating.
- [ ] Confirm export-compliance declaration (`usesNonExemptEncryption: false`).
- [ ] Inspect the final Android AAB manifest and iOS privacy manifest.
- [ ] Confirm content rights for all supplied artwork and store screenshots.
- [ ] Supply App Review contact name, international-format phone, email, and review notes.
- [ ] Add test instructions: no account required; Create World starts local simulation.
- [ ] Configure App Store Connect app record, SKU, primary category, territories, pricing, and release
      mode.
- [ ] Configure Play Console app/game selection, category/tags, countries, pricing, content rating,
      target audience, ads answer, data safety, and app access.
- [ ] Keep Apple/Google/EAS credentials and service-account material outside source control.
- [ ] Do not submit automatically; owner approval is required.

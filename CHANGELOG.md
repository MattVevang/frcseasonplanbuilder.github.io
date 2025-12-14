# Changelog

All notable changes to FRC Season Plan Builder.

## [1.8.0] - 2024-12-14

### Added
- Option to delete entire session from Clear Data dialog

### Changed
- "Clear All" renamed to "Clear Data" with explicit checkboxes for capabilities, strategies, and session deletion
- Checkboxes unchecked by default to prevent accidental data loss
- Clear strategies now removes ALL strategies across all game plans

### Fixed
- "Clear All" button was misleading - now explicitly shows what will be cleared

## [1.7.0] - 2024-12-14

### Added
- Session PIN protection - creators set a 4-digit PIN when creating sessions
- PIN displayed in header for easy reference
- QR codes include PIN for seamless teammate access (scan to join directly)
- PIN validation on workspace entry

### Changed
- Sessions now require a 4-digit PIN set by creator
- Legacy sessions without PIN remain accessible

### Fixed
- Game plans subcollection now properly cleaned up during session deletion

## [1.6.1] - 2024-12-14

### Added
- QR code tip in help documentation

## [1.6.0] - 2024-12-14

### Added
- Case-insensitive session codes
- QR code sharing for easy teammate onboarding
- Fixed session ID display in header

## [1.5.0] - 2024-12-14

### Added
- Centralized match timing configuration
- Time budget tracking to match metrics

### Fixed
- Total match time calculation (was 150s, now correct 170s)

## [1.4.0] - 2024-12-14

### Added
- Game plan rename and duplicate features

### Changed
- Updated data retention messaging to mention Import capability

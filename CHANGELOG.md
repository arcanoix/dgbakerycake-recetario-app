# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.4.0] - 2026-11-06

### Changed
- Quick client dialog in the sales order form now asks for address instead of phone.

## [1.3.0] - 2026-11-05

### Added
- Quick client creation from the sales order form: a "+" button next to the client selector opens a minimal dialog (name and phone) and selects the new client automatically.
- `crearClienteRapido` in `useClientes`, returning the id of the created client.

### Fixed
- Removed a duplicated `ClienteRapidoDialog` import in `OrdenForm` that broke the production build.
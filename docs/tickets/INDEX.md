ID | status | priority | type | title | depends-on
T-001 | done | P2 | chore | Add project_images table and migration | -
T-002 | done | P2 | feature | Add project detail page linked from list | -
T-003 | done | P2 | feature | Add gallery admin actions and UI | T-001
T-004 | done | P2 | feature | Render gallery with lazy image route | T-001, T-003
T-005 | todo | P3 | refactor | Serve main image and video through a route | T-004

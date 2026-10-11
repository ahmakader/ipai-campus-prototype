# IPAI Living Campus - separate edition

Published route: `/ipai-campus-prototype/living/`.
The original `/ipai-campus-prototype/lab/` is preserved unchanged.

This is the World Prompt Pack-inspired living-world edition: an isometric camera,
frosted dashboards, six delivery robots and two cargo drones, object inspection and
camera following, a six-stage delivery tracker, weather/day-night, energy and battery
controls, preset scenario instructions, and access to the existing seven simulation studies.
The supplied Campus and Spaces geometry and material mapping are retained.

The process, routes, performance, loads and capacities are illustrative assumptions,
not live telemetry or an engineering digital twin. Ground movement uses the sampled
paved network, clearance checks, yielding and local rerouting. Complex bottlenecks
can still delay agents. Drone operations are illustrative, not a flight plan.

Serve this folder with any static HTTP server. `start.js` decompresses the bundled
runtime; `model-delivery.js` decompresses the existing model chunks. No backend or
external AI service is required. WebGPU is preferred with a WebGL2 fallback.
Runtime files and model chunks must be deployed alongside index.html.


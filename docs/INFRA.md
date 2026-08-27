# Infrastructure

Ringlight is a static site with no backend, database, model endpoint, secret, scheduled job, or standing compute.

- Runtime: browser-only HTML, CSS, and JavaScript
- Hosting: any HTTPS static host, including Netlify or Vercel
- Build command: none
- Idle resources: none
- Standing cost: none
- Scale to zero: automatic because there is no server process

## Teardown

Remove the static-site project from the chosen host after judging if the URL no longer needs to remain available. There are no other resources to delete.

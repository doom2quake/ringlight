# Synthetic transfer samples

Both sample files use invented accounts and amounts. Load either from Ringlight's secondary **or load your own transfers (CSV/JSON)** control.

- `payments-loop.csv` contains a small closed loop plus two pending destinations.
- `marketplace-payouts.json` contains a fan-out and convergence pattern with no closed loop.

Required fields are `from`, `to`, `amount`, and `timestamp`. Optional fields are `id`, `status`, `fromLabel`, `toLabel`, and `memo`.

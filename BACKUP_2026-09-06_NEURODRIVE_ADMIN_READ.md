# Backup checkpoint — NeuroDrive Admin read fix

Date: 2026-09-06

Purpose: checkpoint before changing the live `neurodrive-admin` Edge Function read path.

Observed production error in Central ENAT HSI:
`Falha na integração: hub_read_failed`

The current function reads `enat_hub.v_assessment_overview`. The next safe change will preserve the existing authentication and privacy contract and switch the administrative read to the underlying Hub tables, avoiding dependency on the view's exposed permissions.

No lesson records are deleted or modified by this checkpoint.

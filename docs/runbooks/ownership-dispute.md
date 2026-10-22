# Runbook: ownership dispute

**How disputes arise:** a second workspace verifies the same website host. Both claims become `disputed` and both profiles become `disputed`, which hides them from the directory. Nobody's data is replaced.

1. Open Admin → Ownership claims.
2. Contact both parties and ask for evidence. Useful evidence: control of the domain's registrar account, a GST registration in the business name, or a business email on the domain.
3. Record the decision with "Verify this claim" or "Reject this claim". The reason is required and stored in the audit log. Verifying one claim rejects the other disputed claims for that host.
4. The winning profile returns as `unpublished` with the verification method recorded, and the owner republishes it. The losing workspace keeps its data but loses the verified badge.
5. Ownership can be transferred later with Settings → Transfer ownership. That's done by the owners themselves, and support can't do it for them.

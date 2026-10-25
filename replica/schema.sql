-- Schema changes for the simple dashboard, on top of the existing Foundly schema
-- (src/db/schema.ts, migrations 0000-0010). Becomes drizzle/0011_* when built.
-- Times are timestamptz (UTC). Access: data-layer checks on workspace_id.

-- 1. The keyword the owner typed; the tracked question is built from it.
--    Null for questions created before this change.
alter table tracked_questions add column keyword text;
alter table tracked_questions
  add constraint tracked_questions_keyword_len check (keyword is null or char_length(keyword) between 2 and 80);
-- Same keyword can't be tracked twice in one workspace (active rows only).
create unique index tracked_questions_ws_keyword_idx
  on tracked_questions (workspace_id, lower(keyword))
  where keyword is not null and archived_at is null;

-- 2. When the owner pressed Start. Before: /app shows the setup steps. After: Performance.
alter table businesses add column monitoring_started_at timestamptz;

-- Scheduler reads only started businesses.
create index businesses_monitoring_started_idx
  on businesses (monitoring_started_at)
  where monitoring_started_at is not null;

-- 3. (Milestone 3) Tone of the answer toward each brand it names.
alter table brand_matches add column sentiment text
  check (sentiment is null or sentiment in ('positive', 'neutral', 'negative'));

-- Existing businesses that already have runs are treated as started, so their
-- home page shows Performance straight away.
update businesses b
set monitoring_started_at = r.first_run
from (
  select business_id, min(created_at) as first_run
  from monitoring_runs
  group by business_id
) r
where r.business_id = b.id and b.monitoring_started_at is null;

-- Query patterns this plan adds, and the existing indexes that serve them:
--   performance: observations where workspace_id = $1 and captured_at > now() - 30 days
--                -> observations_ws_idx (workspace_id, captured_at), then brand_matches_obs_idx
--   won/lost:    same rows grouped by observations.question_id
--   top sources: jsonb_array_elements(observations.citations) grouped by host, same rows
-- No new index needed for these.

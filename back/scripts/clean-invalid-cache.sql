-- Clean invalid cache entries from openai_audience_inferences table
-- These are caused by Instagram redirects to error pages like /accounts

-- 1. Find invalid cache entries (for review)
SELECT
  id,
  instagram_url,
  username,
  inferred_at,
  model_used
FROM openai_audience_inferences
WHERE
  instagram_url LIKE '%/accounts%'
  OR instagram_url LIKE '%/login%'
  OR instagram_url LIKE '%/explore%'
  OR username IN ('accounts', 'login', 'explore', 'p', 'stories', 'direct')
ORDER BY inferred_at DESC;

-- 2. Delete invalid cache entries
-- UNCOMMENT TO EXECUTE:
-- DELETE FROM openai_audience_inferences
-- WHERE
--   instagram_url LIKE '%/accounts%'
--   OR instagram_url LIKE '%/login%'
--   OR instagram_url LIKE '%/explore%'
--   OR username IN ('accounts', 'login', 'explore', 'p', 'stories', 'direct');

-- 3. Verify deletion
-- SELECT COUNT(*) as remaining_invalid_entries
-- FROM openai_audience_inferences
-- WHERE
--   instagram_url LIKE '%/accounts%'
--   OR instagram_url LIKE '%/login%'
--   OR username IN ('accounts', 'login', 'explore', 'p', 'stories', 'direct');

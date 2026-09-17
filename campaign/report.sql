SELECT campaign, content,
 COUNT(DISTINCT CASE WHEN event='page_view' THEN visit_id END) AS visits,
 COUNT(DISTINCT CASE WHEN event='video_start' THEN visit_id END) AS video_viewers,
 COUNT(DISTINCT CASE WHEN event='demo_click' THEN visit_id END) AS demo_clickers,
 COUNT(DISTINCT CASE WHEN event='trial_click' THEN visit_id END) AS trial_clickers,
 COUNT(DISTINCT CASE WHEN event='fab_click' THEN visit_id END) AS fab_clickers,
 COUNT(DISTINCT CASE WHEN event='demo_complete' THEN visit_id END) AS demo_completed,
 COUNT(DISTINCT CASE WHEN event='inventory_interaction' THEN visit_id END) AS inventory_users,
 COUNT(DISTINCT CASE WHEN event='pricing_view' THEN visit_id END) AS pricing_viewers
FROM (SELECT * FROM events UNION ALL SELECT * FROM engagement_events)
WHERE source <> 'qa' AND occurred_at >= strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days')
GROUP BY campaign, content ORDER BY visits DESC;

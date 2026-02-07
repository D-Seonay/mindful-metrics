Please provide your Supabase URL and anon key.

I will also need you to run the following SQL query in your Supabase dashboard to create the `scores` table:

```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  score_main NUMERIC NOT NULL,
  score_secondary NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Optional: Create indexes for faster queries
CREATE INDEX idx_scores_test_type ON scores(test_type);
CREATE INDEX idx_scores_score_main_asc ON scores(score_main ASC);
CREATE INDEX idx_scores_score_main_desc ON scores(score_main DESC);
```

I've noticed that you mentioned a 'memory' test, but I can only find `TimePerception.tsx`. Should I consider `TimePerception` as the memory test for the leaderboard?

Once you provide the credentials, I will proceed with creating the Supabase client and the leaderboard page.

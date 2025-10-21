-- seed an admin so FK works
INSERT INTO admins (id, email)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO agent_list (first_name, last_name, email, admin_id)
VALUES
  ('Ada', 'Lovelace', 'ada@example.com', '11111111-1111-1111-1111-111111111111'),
  ('Grace', 'Hopper', 'grace@example.com', '11111111-1111-1111-1111-111111111111'),
  ('test', 'ing', 'test@example.com', '11111111-1111-1111-1111-111111111111'),
  ('Ryan', 'Tan', 'shao@en.com', '11111111-1111-1111-1111-111111111111'),
ON CONFLICT DO NOTHING;

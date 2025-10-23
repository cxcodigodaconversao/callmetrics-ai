-- Adicionar role admin ao usuário cxcodigodaconversao@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM profiles
WHERE email = 'cxcodigodaconversao@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
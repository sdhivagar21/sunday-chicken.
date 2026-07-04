-- ================================================================
-- Sunday Chicken — Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ================================================================

-- ── CATEGORIES ───────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, sort_order) VALUES
  ('ca000001-0000-0000-0000-000000000001', 'Whole Chicken',   'whole-chicken',   1),
  ('ca000001-0000-0000-0000-000000000002', 'Chicken Cuts',    'chicken-cuts',    2),
  ('ca000001-0000-0000-0000-000000000003', 'Chicken Liver',   'chicken-liver',   3),
  ('ca000001-0000-0000-0000-000000000004', 'Chicken Organs',  'chicken-organs',  4),
  ('ca000001-0000-0000-0000-000000000005', 'Eggs',            'eggs',            5),
  ('ca000001-0000-0000-0000-000000000006', 'Mutton',          'mutton',          6)
ON CONFLICT (slug) DO NOTHING;

-- ── PRODUCTS ─────────────────────────────────────────────────────
INSERT INTO products (id, name, description, cost_per_kg, category_id, is_available, is_featured, sort_order) VALUES

  -- Whole Chicken
  ('pr000001-0000-0000-0000-000000000001',
   'Fresh Whole Chicken',
   'Farm-fresh whole chicken, cleaned and ready to cook. Dressed and hygienically packed. Perfect for biriyani, curry, and roasts. You can request small pieces, medium pieces, or skinless.',
   230.00, 'ca000001-0000-0000-0000-000000000001', true, true, 1),

  ('pr000001-0000-0000-0000-000000000002',
   'Country Chicken (Nattu Kozhi)',
   'Premium free-range country chicken with rich, deep flavour. Slow-raised for superior taste. Ideal for traditional Tamil recipes, Chettinad curry, and medicinal pepper soups.',
   380.00, 'ca000001-0000-0000-0000-000000000001', true, true, 2),

  -- Chicken Cuts
  ('pr000001-0000-0000-0000-000000000003',
   'Chicken Breast (Boneless)',
   'Lean, protein-rich boneless chicken breast. Skinless and fat-trimmed. Great for grills, rolls, sandwiches, and healthy high-protein meals.',
   320.00, 'ca000001-0000-0000-0000-000000000002', true, false, 3),

  ('pr000001-0000-0000-0000-000000000004',
   'Chicken Thigh (Boneless)',
   'Juicy and tender boneless thigh pieces with the perfect fat-to-meat ratio. Best for biriyani, kebabs, butter chicken, and stir-fries.',
   300.00, 'ca000001-0000-0000-0000-000000000002', true, false, 4),

  ('pr000001-0000-0000-0000-000000000005',
   'Chicken Drumsticks (Legs)',
   'Meaty drumsticks with bone — great for tandoor, fry, and gravy preparations. Can be requested skin-on or skinless.',
   260.00, 'ca000001-0000-0000-0000-000000000002', true, false, 5),

  ('pr000001-0000-0000-0000-000000000006',
   'Chicken Wings',
   'Crispy and flavourful wings, perfect for grilling, air frying, and party snacks. Request whole wings or wingettes.',
   240.00, 'ca000001-0000-0000-0000-000000000002', true, false, 6),

  ('pr000001-0000-0000-0000-000000000007',
   'Chicken Curry Cut (Mixed Pieces)',
   'Pre-cut mixed pieces — breast, thigh, and leg — ready for cooking. The everyday staple for home cooking. Mention if you want small, medium, or large pieces.',
   250.00, 'ca000001-0000-0000-0000-000000000002', true, true, 7),

  ('pr000001-0000-0000-0000-000000000008',
   'Chicken Keema (Minced Chicken)',
   'Freshly minced chicken with no bone. Ideal for keema curry, cutlets, stuffed parathas, and momos. Fat percentage is moderate.',
   290.00, 'ca000001-0000-0000-0000-000000000002', true, false, 8),

  -- Liver
  ('pr000001-0000-0000-0000-000000000009',
   'Chicken Liver',
   'Farm-fresh chicken liver, cleaned, trimmed and ready to cook. Rich in iron, protein, and Vitamin A. Perfect for pepper fry, masala, and liver 65.',
   180.00, 'ca000001-0000-0000-0000-000000000003', true, true, 9),

  -- Organs
  ('pr000001-0000-0000-0000-000000000010',
   'Chicken Gizzard',
   'Cleaned and trimmed chicken gizzard. Chewy and flavourful. Popular in South Indian street food and traditional recipes.',
   160.00, 'ca000001-0000-0000-0000-000000000004', true, false, 10),

  ('pr000001-0000-0000-0000-000000000011',
   'Chicken Heart',
   'Fresh chicken hearts, cleaned and ready. Nutritious, protein-dense, and delicious when prepared with South Indian spices.',
   170.00, 'ca000001-0000-0000-0000-000000000004', true, false, 11),

  ('pr000001-0000-0000-0000-000000000012',
   'Mixed Organ Pack (Liver + Gizzard + Heart)',
   'Value combo pack of mixed organs. Perfect for a full traditional South Indian organ masala — a local favourite.',
   165.00, 'ca000001-0000-0000-0000-000000000004', true, false, 12),

  -- Eggs (priced per unit, sold by count not kg — cost_per_kg field used as price per egg here)
  ('pr000001-0000-0000-0000-000000000013',
   'Farm Fresh Eggs',
   'Fresh eggs from farm-raised hens. Rich yolk, thick shell, consistent size. Available in sets of 6, 12, or 30. Select quantity in the weight field (0.5 = 6 eggs, 1 = 12 eggs, 2.5 = 30 eggs).',
   7.00, 'ca000001-0000-0000-0000-000000000005', true, true, 13),

  ('pr000001-0000-0000-0000-000000000014',
   'Country Eggs (Nattu Muttai)',
   'Free-range country eggs with a deep orange yolk and superior taste. Highly nutritious, naturally sourced. A pure desi experience.',
   12.00, 'ca000001-0000-0000-0000-000000000005', true, false, 14),

  -- Mutton
  ('pr000001-0000-0000-0000-000000000015',
   'Fresh Mutton (Curry Cut)',
   'Tender goat meat in curry cut pieces, sourced from locally raised goats. Rich, authentic flavour ideal for mutton curry, biriyani, and kuzhambu.',
   700.00, 'ca000001-0000-0000-0000-000000000006', true, false, 15)

ON CONFLICT (id) DO NOTHING;

-- ── ADMIN USER ───────────────────────────────────────────────────
-- Login: Phone = 9999999999   Password = Admin@123
-- IMPORTANT: Change this password after your first login via the app!
INSERT INTO users (id, name, phone, email, password_hash, role) VALUES (
  'us000001-0000-0000-0000-000000000001',
  'Sunday Chicken Admin',
  '9999999999',
  'admin@sundaychicken.in',
  '$2a$12$0YeBTgDHNdRB7Wz79TkeU.tBi/1bbMEPb.1JwYOM3oZ0x1JGghT0i',
  'admin'
) ON CONFLICT (phone) DO NOTHING;

-- ── VERIFY (this shows counts after running) ─────────────────────
SELECT 'Categories: ' || COUNT(*) AS result FROM categories
UNION ALL
SELECT 'Products: '   || COUNT(*) FROM products
UNION ALL
SELECT 'Admin users: '|| COUNT(*) FROM users WHERE role = 'admin';

-- ============================================
-- INSERT GENERIC PRIVATE-LABEL DATA FOR TESTING
-- Copy and paste this in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
    casual_category_id UUID;
    brown_color_id UUID;
    green_color_id UUID;
    blue_color_id UUID;
    small_size_id UUID;
    medium_size_id UUID;
    large_size_id UUID;
    xlarge_size_id UUID;
    product1_id UUID;
    product2_id UUID;
    product3_id UUID;
    product4_id UUID;
    product5_id UUID;
    product6_id UUID;
    product7_id UUID;
    product8_id UUID;
BEGIN
    SELECT id INTO casual_category_id FROM categories WHERE slug = 'casual' LIMIT 1;

    SELECT id INTO brown_color_id FROM colors WHERE name = 'Brown' LIMIT 1;
    SELECT id INTO green_color_id FROM colors WHERE name = 'Green' LIMIT 1;
    SELECT id INTO blue_color_id FROM colors WHERE name = 'Blue' LIMIT 1;

    SELECT id INTO small_size_id FROM sizes WHERE name = 'Small' LIMIT 1;
    SELECT id INTO medium_size_id FROM sizes WHERE name = 'Medium' LIMIT 1;
    SELECT id INTO large_size_id FROM sizes WHERE name = 'Large' LIMIT 1;
    SELECT id INTO xlarge_size_id FROM sizes WHERE name = 'X-Large' LIMIT 1;

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Men''s Cotton T-Shirt', 'mens-cotton-t-shirt', 'Soft cotton crew neck tee — private-label generic style.', 98, NULL, NULL, casual_category_id, true, 4.5, 10)
    RETURNING id INTO product1_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES
        (product1_id, '/images/pic1.png', 'Men''s Cotton T-Shirt', 0, true),
        (product1_id, '/images/pic10.png', 'Men''s Cotton T-Shirt - Gallery', 1, false),
        (product1_id, '/images/pic11.png', 'Men''s Cotton T-Shirt - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product1_id, blue_color_id, medium_size_id, 10),
        (product1_id, blue_color_id, large_size_id, 15),
        (product1_id, green_color_id, medium_size_id, 8);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Casual Denim Jeans', 'casual-denim-jeans', 'Straight-fit denim with classic five-pocket styling.', 165, 'percentage', 20, casual_category_id, true, 3.5, 5)
    RETURNING id INTO product2_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product2_id, '/images/pic2.png', 'Casual Denim Jeans', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product2_id, brown_color_id, small_size_id, 12),
        (product2_id, brown_color_id, medium_size_id, 20),
        (product2_id, blue_color_id, large_size_id, 8);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Oversized Hoodie', 'oversized-hoodie', 'Mid-weight fleece hoodie with a relaxed fit.', 155, NULL, NULL, casual_category_id, true, 4.5, 8)
    RETURNING id INTO product3_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product3_id, '/images/pic3.png', 'Oversized Hoodie', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product3_id, blue_color_id, medium_size_id, 15),
        (product3_id, green_color_id, large_size_id, 10);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Cargo Pants', 'cargo-pants', 'Relaxed cargo pants with utility pockets.', 138, 'percentage', 30, casual_category_id, true, 4.5, 12)
    RETURNING id INTO product4_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES
        (product4_id, '/images/pic4.png', 'Cargo Pants', 0, true),
        (product4_id, '/images/pic10.png', 'Cargo Pants - Gallery', 1, false),
        (product4_id, '/images/pic11.png', 'Cargo Pants - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product4_id, blue_color_id, small_size_id, 18),
        (product4_id, green_color_id, medium_size_id, 22),
        (product4_id, blue_color_id, large_size_id, 14);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Women''s Sports Leggings', 'womens-sports-leggings', 'High-rise leggings with four-way stretch.', 92, 'percentage', 20, casual_category_id, true, 5.0, 25)
    RETURNING id INTO product5_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES
        (product5_id, '/images/pic5.png', 'Women''s Sports Leggings', 0, true),
        (product5_id, '/images/pic10.png', 'Women''s Sports Leggings - Gallery', 1, false),
        (product5_id, '/images/pic11.png', 'Women''s Sports Leggings - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product5_id, blue_color_id, medium_size_id, 20),
        (product5_id, green_color_id, large_size_id, 15);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Running Shoes', 'running-shoes', 'Lightweight running shoes with cushioned midsole.', 128, NULL, NULL, casual_category_id, true, 4.0, 18)
    RETURNING id INTO product6_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES
        (product6_id, '/images/pic6.png', 'Running Shoes', 0, true),
        (product6_id, '/images/pic10.png', 'Running Shoes - Gallery', 1, false),
        (product6_id, '/images/pic11.png', 'Running Shoes - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product6_id, brown_color_id, small_size_id, 10),
        (product6_id, blue_color_id, medium_size_id, 16),
        (product6_id, green_color_id, large_size_id, 12);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Leather Wallet', 'leather-wallet', 'Full-grain leather bifold wallet with card slots.', 68, NULL, NULL, casual_category_id, true, 3.0, 6)
    RETURNING id INTO product7_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product7_id, '/images/pic7.png', 'Leather Wallet', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product7_id, brown_color_id, medium_size_id, 14),
        (product7_id, blue_color_id, large_size_id, 10);

    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Baseball Cap', 'baseball-cap', 'Cotton twill cap with adjustable back strap.', 42, NULL, NULL, casual_category_id, true, 4.5, 15)
    RETURNING id INTO product8_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product8_id, '/images/pic8.png', 'Baseball Cap', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES
        (product8_id, blue_color_id, small_size_id, 8),
        (product8_id, brown_color_id, medium_size_id, 18),
        (product8_id, blue_color_id, large_size_id, 12);

    INSERT INTO reviews (product_id, user_name, rating, content, is_approved)
    VALUES
        (product1_id, 'Alex K.', 5, 'Great quality generic tee — exactly what I expected from a private-label store.', true),
        (product5_id, 'Sarah M.', 5, 'The leggings fit well and there are no brand logos anywhere. Perfect.', true),
        (product6_id, 'James L.', 5, 'Comfortable running shoes with a clean, unbranded look.', true);

END $$;

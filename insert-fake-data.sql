-- ============================================
-- INSERT FAKE DATA FOR TESTING
-- Copy and paste this in Supabase SQL Editor
-- ============================================

-- First, get the category ID (assuming 'Casual' category exists from schema)
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
    -- Get category ID
    SELECT id INTO casual_category_id FROM categories WHERE slug = 'casual' LIMIT 1;
    
    -- Get color IDs
    SELECT id INTO brown_color_id FROM colors WHERE name = 'Brown' LIMIT 1;
    SELECT id INTO green_color_id FROM colors WHERE name = 'Green' LIMIT 1;
    SELECT id INTO blue_color_id FROM colors WHERE name = 'Blue' LIMIT 1;
    
    -- Get size IDs
    SELECT id INTO small_size_id FROM sizes WHERE name = 'Small' LIMIT 1;
    SELECT id INTO medium_size_id FROM sizes WHERE name = 'Medium' LIMIT 1;
    SELECT id INTO large_size_id FROM sizes WHERE name = 'Large' LIMIT 1;
    SELECT id INTO xlarge_size_id FROM sizes WHERE name = 'X-Large' LIMIT 1;

    -- Insert Product 1: T-shirt with Tape Details
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('T-shirt with Tape Details', 't-shirt-with-tape-details', 'This graphic t-shirt which is perfect for any occasion.', 120, NULL, NULL, casual_category_id, true, 4.5, 10)
    RETURNING id INTO product1_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES 
        (product1_id, '/images/pic1.png', 'T-shirt with Tape Details', 0, true),
        (product1_id, '/images/pic10.png', 'T-shirt with Tape Details - Gallery', 1, false),
        (product1_id, '/images/pic11.png', 'T-shirt with Tape Details - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product1_id, blue_color_id, medium_size_id, 10),
        (product1_id, blue_color_id, large_size_id, 15),
        (product1_id, green_color_id, medium_size_id, 8);

    -- Insert Product 2: Skinny Fit Jeans
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Skinny Fit Jeans', 'skinny-fit-jeans', 'Perfect fit jeans for everyday wear.', 260, 'percentage', 20, casual_category_id, true, 3.5, 5)
    RETURNING id INTO product2_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product2_id, '/images/pic2.png', 'Skinny Fit Jeans', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product2_id, brown_color_id, small_size_id, 12),
        (product2_id, brown_color_id, medium_size_id, 20),
        (product2_id, blue_color_id, large_size_id, 8);

    -- Insert Product 3: Chechered Shirt
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Chechered Shirt', 'chechered-shirt', 'Classic chechered pattern shirt.', 180, NULL, NULL, casual_category_id, true, 4.5, 8)
    RETURNING id INTO product3_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product3_id, '/images/pic3.png', 'Chechered Shirt', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product3_id, blue_color_id, medium_size_id, 15),
        (product3_id, green_color_id, large_size_id, 10);

    -- Insert Product 4: Sleeve Striped T-shirt
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_new_arrival, average_rating, total_reviews)
    VALUES ('Sleeve Striped T-shirt', 'sleeve-striped-t-shirt', 'Stylish striped t-shirt with unique sleeve design.', 160, 'percentage', 30, casual_category_id, true, 4.5, 12)
    RETURNING id INTO product4_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES 
        (product4_id, '/images/pic4.png', 'Sleeve Striped T-shirt', 0, true),
        (product4_id, '/images/pic10.png', 'Sleeve Striped T-shirt - Gallery', 1, false),
        (product4_id, '/images/pic11.png', 'Sleeve Striped T-shirt - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product4_id, blue_color_id, small_size_id, 18),
        (product4_id, green_color_id, medium_size_id, 22),
        (product4_id, blue_color_id, large_size_id, 14);

    -- Insert Product 5: Vertical Striped Shirt (Top Selling)
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Vertical Striped Shirt', 'vertical-striped-shirt', 'Elegant vertical striped design.', 232, 'percentage', 20, casual_category_id, true, 5.0, 25)
    RETURNING id INTO product5_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES 
        (product5_id, '/images/pic5.png', 'Vertical Striped Shirt', 0, true),
        (product5_id, '/images/pic10.png', 'Vertical Striped Shirt - Gallery', 1, false),
        (product5_id, '/images/pic11.png', 'Vertical Striped Shirt - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product5_id, blue_color_id, medium_size_id, 20),
        (product5_id, green_color_id, large_size_id, 15);

    -- Insert Product 6: Courage Graphic T-shirt (Top Selling)
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Courage Graphic T-shirt', 'courage-graphic-t-shirt', 'Bold graphic design t-shirt.', 145, NULL, NULL, casual_category_id, true, 4.0, 18)
    RETURNING id INTO product6_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES 
        (product6_id, '/images/pic6.png', 'Courage Graphic T-shirt', 0, true),
        (product6_id, '/images/pic10.png', 'Courage Graphic T-shirt - Gallery', 1, false),
        (product6_id, '/images/pic11.png', 'Courage Graphic T-shirt - Gallery', 2, false);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product6_id, brown_color_id, small_size_id, 10),
        (product6_id, blue_color_id, medium_size_id, 16),
        (product6_id, green_color_id, large_size_id, 12);

    -- Insert Product 7: Loose Fit Bermuda Shorts (Top Selling)
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Loose Fit Bermuda Shorts', 'loose-fit-bermuda-shorts', 'Comfortable loose fit shorts.', 80, NULL, NULL, casual_category_id, true, 3.0, 6)
    RETURNING id INTO product7_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product7_id, '/images/pic7.png', 'Loose Fit Bermuda Shorts', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product7_id, brown_color_id, medium_size_id, 14),
        (product7_id, blue_color_id, large_size_id, 10);

    -- Insert Product 8: Faded Skinny Jeans (Top Selling)
    INSERT INTO products (title, slug, description, base_price, discount_type, discount_value, category_id, is_top_selling, average_rating, total_reviews)
    VALUES ('Faded Skinny Jeans', 'faded-skinny-jeans', 'Classic faded skinny jeans.', 210, NULL, NULL, casual_category_id, true, 4.5, 15)
    RETURNING id INTO product8_id;

    INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
    VALUES (product8_id, '/images/pic8.png', 'Faded Skinny Jeans', 0, true);

    INSERT INTO product_variants (product_id, color_id, size_id, stock_quantity)
    VALUES 
        (product8_id, blue_color_id, small_size_id, 8),
        (product8_id, brown_color_id, medium_size_id, 18),
        (product8_id, blue_color_id, large_size_id, 12);

    -- Insert some reviews
    INSERT INTO reviews (product_id, user_name, rating, content, is_approved)
    VALUES 
        (product1_id, 'Alex K.', 5, 'Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.', true),
        (product5_id, 'Sarah M.', 5, 'I''m blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I''ve bought has exceeded my expectations.', true),
        (product6_id, 'James L.', 5, 'As someone who''s always on the lookout for unique fashion pieces, I''m thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.', true);

END $$;







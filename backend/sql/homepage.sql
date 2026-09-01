-- ============================================
-- HOMEPAGE TABLE
-- ============================================

USE fahim_portfolio;

CREATE TABLE IF NOT EXISTS homepage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section ENUM('hero', 'intro', 'quotes', 'music') NOT NULL,
    content_key VARCHAR(100) NOT NULL,
    content_value TEXT,
    content_type ENUM('text', 'image', 'video', 'html') DEFAULT 'text',
    sort_order INT DEFAULT 0
);

-- ============================================
-- INSERT HOMEPAGE DATA (from current site)
-- ============================================

-- HERO SECTION
INSERT INTO homepage (section, content_key, content_value, content_type, sort_order) VALUES
('hero', 'photo', 'assets/profile.jpg', 'image', 1),
('hero', 'tagline', 'MIS graduate exploring the intersection of technology, data, and business, with a passion for learning, building, and solving problems.', 'text', 2);

-- INTRO SECTION (paragraphs)
INSERT INTO homepage (section, content_key, content_value, content_type, sort_order) VALUES
('intro', 'paragraph_1', 'I was born and raised in Jashore District Southwest part of Bangladesh, in an environment where family, friendship, curiosity, and learning have always been an important part of my life. From an early age, I was fascinated by computers and technology—not just by using them, but by understanding what they could do and how they could make things better. That curiosity eventually grew into a strong interest in the connection between technology, business, and data.', 'text', 1),
('intro', 'paragraph_2', 'I earned my Bachelor of Business Administration in Management Information Systems from the American International University-Bangladesh (AIUB). What drew me to MIS was the idea that technology is more than just software and devices—it can be a powerful tool for solving business problems, improving decisions, and creating opportunities for growth. I became particularly interested in how businesses manage information, how valuable data can be turned into meaningful insights, and how tools and technologies can change the way organizations operate. My studies in Business Intelligence and Decision Support Systems and Data Warehouse and Data Mining strengthened that interest and encouraged me to explore the possibilities of data-driven decision-making.', 'text', 2),
('intro', 'paragraph_3', 'I am naturally a do-it-and-learn person. I enjoy getting my hands on something new, figuring out how it works, experimenting with different tools, and learning through experience. Technology continues to be one of my biggest interests, but it is only one part of who I am. I enjoy reading, discovering new skills, spending time with friends, and being around people. I have also explored creative interests such as pixel art and have always enjoyed video games. These days, I do not get as much time to play as I used to, but the curiosity and creativity behind those interests are still a part of me. Recently, I have also started playing football, which has given me another way to stay active and connected with others.', 'text', 3),
('intro', 'paragraph_4', 'I am someone who likes to keep moving, keep learning, and keep experimenting. I believe the best way to grow is to stay curious, take action, and be willing to try something unfamiliar. Whether it is a new technology, a new idea, a new skill, or a completely different challenge, I enjoy the process of figuring things out and turning curiosity into action.', 'text', 4);

-- INTRO GALLERY IMAGES
INSERT INTO homepage (section, content_key, content_value, content_type, sort_order) VALUES
('intro', 'gallery_1', 'assets/gallery1.jpg', 'image', 10),
('intro', 'gallery_2', 'assets/gallery2.jpg', 'image', 11);

-- QUOTES (format: "Quote text|Author Name")
INSERT INTO homepage (section, content_key, content_value, content_type, sort_order) VALUES
('quotes', 'quote_1', 'The only way to do great work is to love what you do.|Steve Jobs', 'text', 1),
('quotes', 'quote_2', 'In the middle of difficulty lies opportunity.|Albert Einstein', 'text', 2),
('quotes', 'quote_3', 'Success is not final, failure is not fatal: it is the courage to continue that counts.|Winston Churchill', 'text', 3),
('quotes', 'quote_4', 'The future belongs to those who believe in the beauty of their dreams.|Eleanor Roosevelt', 'text', 4),
('quotes', 'quote_5', 'It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.|Charles Darwin', 'text', 5);

-- MUSIC SECTION
INSERT INTO homepage (section, content_key, content_value, content_type, sort_order) VALUES
('music', 'video_url', 'https://www.youtube.com/embed/m_kZgCv_s5s', 'video', 1),
('music', 'label', 'Current song on repeat:', 'text', 2);

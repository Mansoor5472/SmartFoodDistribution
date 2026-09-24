-- ==========================================================
-- SMART FOOD DISTRIBUTION PLATFORM
-- Database Schema (MySQL 8.0+ compatible)
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- ==========================================================

CREATE DATABASE IF NOT EXISTS smart_food_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_food_db;

-- Disable foreign key checks for clean recreation if needed
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS distribution_records;
DROP TABLE IF EXISTS pickup_assignments;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS food_requests;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('DONOR', 'NGO', 'BENEFICIARY', 'ADMIN') NOT NULL DEFAULT 'DONOR',
    organization_name VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    latitude DECIMAL(10, 7) NULL DEFAULT 28.6139,  -- Default sample coords
    longitude DECIMAL(10, 7) NULL DEFAULT 77.2090,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 2. LOCATIONS TABLE (Saved / Verified Locations)
-- ----------------------------------------------------------
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_person VARCHAR(100) NULL,
    contact_phone VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 3. DONATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    food_name VARCHAR(180) NOT NULL,
    food_category ENUM('COOKED_MEALS', 'BAKERY', 'PRODUCE_FRUITS', 'DAIRY', 'PACKAGED_FOOD', 'BEVERAGES', 'OTHER') NOT NULL DEFAULT 'COOKED_MEALS',
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    quantity_kg DECIMAL(8, 2) NOT NULL DEFAULT 1.00,
    servings INT NOT NULL DEFAULT 10,
    preparation_time DATETIME NOT NULL,
    expiry_time DATETIME NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL DEFAULT 28.6139,
    longitude DECIMAL(10, 7) NOT NULL DEFAULT 77.2090,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    contact_phone VARCHAR(30) NOT NULL,
    status ENUM('AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donation_status (status),
    INDEX idx_donation_donor (donor_id),
    INDEX idx_donation_expiry (expiry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 4. FOOD REQUESTS TABLE (Beneficiaries)
-- ----------------------------------------------------------
CREATE TABLE food_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    required_servings INT NOT NULL DEFAULT 20,
    food_preference ENUM('ANY', 'VEG_ONLY', 'NON_VEG') NOT NULL DEFAULT 'ANY',
    urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    delivery_address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL DEFAULT 28.6139,
    longitude DECIMAL(10, 7) NOT NULL DEFAULT 77.2090,
    contact_phone VARCHAR(30) NOT NULL,
    notes TEXT NULL,
    status ENUM('PENDING', 'MATCHED', 'ASSIGNED', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiary_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_request_status (status),
    INDEX idx_request_beneficiary (beneficiary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 5. MATCHES TABLE (AI / Recommendation links)
-- ----------------------------------------------------------
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    request_id INT NULL,
    ngo_id INT NOT NULL,
    match_score DECIMAL(5, 2) NOT NULL DEFAULT 85.00,
    distance_km DECIMAL(6, 2) NOT NULL DEFAULT 2.50,
    status ENUM('SUGGESTED', 'ACCEPTED', 'DECLINED', 'COMPLETED') NOT NULL DEFAULT 'SUGGESTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES food_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_match_donation (donation_id),
    INDEX idx_match_ngo (ngo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 6. PICKUP ASSIGNMENTS TABLE (NGO / Volunteer logistics)
-- ----------------------------------------------------------
CREATE TABLE pickup_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL UNIQUE,
    ngo_id INT NOT NULL,
    driver_name VARCHAR(120) NOT NULL,
    driver_phone VARCHAR(30) NOT NULL,
    vehicle_number VARCHAR(50) NULL,
    pickup_notes TEXT NULL,
    verification_code VARCHAR(10) NOT NULL DEFAULT '1234',
    status ENUM('ASSIGNED', 'EN_ROUTE', 'COLLECTED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pickup_ngo (ngo_id),
    INDEX idx_pickup_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 7. DISTRIBUTION RECORDS TABLE (Fulfillment logs)
-- ----------------------------------------------------------
CREATE TABLE distribution_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    ngo_id INT NOT NULL,
    beneficiary_id INT NULL,
    food_request_id INT NULL,
    servings_distributed INT NOT NULL,
    distribution_address VARCHAR(255) NOT NULL,
    proof_notes TEXT NULL,
    distributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (beneficiary_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (food_request_id) REFERENCES food_requests(id) ON DELETE SET NULL,
    INDEX idx_dist_ngo (ngo_id),
    INDEX idx_dist_donation (donation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'URGENT') NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 9. REVIEWS & RATINGS TABLE
-- ----------------------------------------------------------
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 10. DEMAND PREDICTIONS TABLE (AI/ML Historical Logs)
-- ----------------------------------------------------------
CREATE TABLE demand_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_date DATETIME NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT 'South Extension',
    food_category VARCHAR(50) NOT NULL DEFAULT 'COOKED_MEALS',
    predicted_meals INT NOT NULL,
    predicted_food_kg DECIMAL(8, 2) NOT NULL,
    confidence_score DECIMAL(5, 2) NOT NULL DEFAULT 92.50,
    model_name VARCHAR(100) NOT NULL DEFAULT 'Random Forest Regressor',
    features_json TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pred_date (target_date),
    INDEX idx_pred_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

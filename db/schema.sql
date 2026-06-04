-- TS EAMCET College Predictor Schema
-- Using PostgreSQL (Supabase)

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: cutoff_ranks
CREATE TABLE IF NOT EXISTS cutoff_ranks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_code TEXT NOT NULL,
    institute_name TEXT NOT NULL,
    place TEXT,
    district_code TEXT,
    branch_code TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL, 
    closing_rank INTEGER NOT NULL,
    year INTEGER NOT NULL,
    is_autonomous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Indexes for Prediction Queries

-- 1. Index on closing_rank for fast filtering (rank <= user_rank)
CREATE INDEX idx_cutoff_ranks_closing_rank ON cutoff_ranks(closing_rank);

-- 2. Composite index for the most common search pattern: 
-- Finding colleges for a specific category, gender, and rank
CREATE INDEX idx_cutoff_prediction_lookup ON cutoff_ranks(category, gender, closing_rank);

-- 3. Index on branch_code for filtering by stream
CREATE INDEX idx_cutoff_ranks_branch ON cutoff_ranks(branch_code);

-- 4. Index on district for regional filtering
CREATE INDEX idx_cutoff_ranks_district ON cutoff_ranks(district_code);

-- 5. Index on institute_code for specific college lookups
CREATE INDEX idx_cutoff_ranks_institute ON cutoff_ranks(institute_code);

-- Commentary:
-- We use UUID for 'id' to ensure uniqueness across environments.
-- Table: students (for login and tracking)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    password VARCHAR(200),
    rank INTEGER,
    category VARCHAR(20),
    gender VARCHAR(5),
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for admin dashboard searching
CREATE INDEX idx_students_mobile ON students(mobile_number);
CREATE INDEX idx_students_name ON students(name);

-- Student question and chat conversation tables
CREATE TABLE IF NOT EXISTS student_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    college_id UUID,
    college_name TEXT NOT NULL,
    branch_code TEXT,
    branch_name TEXT,
    question TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID NOT NULL REFERENCES student_queries(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('student', 'admin')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_query ON chat_messages(query_id);


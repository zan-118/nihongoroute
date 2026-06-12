-- Migration: Expand sentences table for broader feature utilization
-- Created At: 2026-06-12T00:00:00+07:00
--
-- Purpose:
-- - Add jlpt_level column for level-aware sentence queries (mini drill, flashcards, etc.)
-- - Enable pg_trgm extension for efficient trigram LIKE '%word%' searches
-- - Add GIN trigram index on japanese column to replace slow sequential scans

-- ---------------------------------------------------------------------------
-- Add JLPT level column
-- ---------------------------------------------------------------------------

ALTER TABLE public.sentences
  ADD COLUMN IF NOT EXISTS jlpt_level text;

CREATE INDEX IF NOT EXISTS idx_sentences_jlpt_level
  ON public.sentences(jlpt_level);

-- ---------------------------------------------------------------------------
-- Enable pg_trgm for efficient substring search
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index for LIKE '%word%' on japanese text
-- This replaces the existing B-tree index which only helps prefix LIKE 'word%'
CREATE INDEX IF NOT EXISTS idx_sentences_japanese_trgm
  ON public.sentences USING gin (japanese gin_trgm_ops);

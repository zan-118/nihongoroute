import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Card, Text, Select } from '@sanity/ui';
import { set, unset } from 'sanity';

import { getApiUrl, SECRET_TOKEN } from './api';

interface SupabaseCategory {
  id: string | number;
  title: string;
  slug?: string;
}

interface SupabaseCategorySelectProps {
  onChange: (patch: unknown) => void;
  value?: string;
  schemaType: {
    title?: string;
    description?: string;
  };
}

export function SupabaseCategorySelect(props: SupabaseCategorySelectProps) {
  const { onChange, value = '', schemaType } = props;
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          getApiUrl(`/api/admin/supabase-search?type=category&secret=${SECRET_TOKEN}`)
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        if (json.data && active) {
          setCategories(json.data);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch categories from Supabase Bridge:', err);
        if (active) {
          const errorMessage = err instanceof Error ? err.message : 'Gagal memuat kategori';
          setError(errorMessage);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = useCallback((event: React.FormEvent<HTMLSelectElement>) => {
    const nextValue = event.currentTarget.value;
    onChange(nextValue ? set(nextValue) : unset());
  }, [onChange]);

  return (
    <Stack space={2}>
      <Text size={1} weight="semibold">
        {schemaType.title || 'Course Category (Supabase)'}
      </Text>
      {schemaType.description && (
        <Text size={1} muted style={{ fontStyle: 'italic' }}>
          {schemaType.description}
        </Text>
      )}
      {loading ? (
        <Text size={1} muted>Memuat kategori dari Supabase…</Text>
      ) : error ? (
        <Card tone="critical" padding={2} radius={2}>
          <Text size={1}>Error: {error}</Text>
        </Card>
      ) : (
        <Select
          value={value}
          onChange={handleChange}
        >
          <option value="">-- Pilih Kategori Kursus --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug || cat.id}>
              {cat.title} ({cat.slug || 'no-slug'})
            </option>
          ))}
        </Select>
      )}
    </Stack>
  );
}

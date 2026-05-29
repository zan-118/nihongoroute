/**
 * @file SupabaseSelector.tsx
 * @description Komponen pemilih kustom Sanity Studio yang memfasilitasi pencarian asinkron (debounced) dan scan konten AI dari database Supabase (kanji, kosakata, tata bahasa). Mengikat data pelajaran statis Sanity ke basis data dinamis Supabase secara terintegrasi.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Card, Text, TextInput, Button, Flex, Box, Spinner, Badge } from '@sanity/ui';
import { set, unset, useFormValue } from 'sanity';
import { getApiUrl, SECRET_TOKEN } from './api';

// ==========================================
// ANTARMUKA PROPS & BLOK KONTEN
// ==========================================
interface ContentBlock {
  _type: string;
  title?: string;
  content?: string;
  furigana?: string;
  examples?: Array<{
    jp?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface SanityDocumentValue {
  content_blocks?: ContentBlock[];
  [key: string]: unknown;
}

interface SupabaseSearchResult {
  id: string | number;
  character?: string;
  meaning?: string;
  word?: string;
  furigana?: string;
  meaning_id?: string;
  title?: string;
  slug?: string;
  jlpt_level?: string;
  [key: string]: unknown;
}

interface SupabaseSelectorProps {
  onChange: (patch: unknown) => void;
  value?: string[];
  schemaType: {
    title?: string;
    options?: {
      supabaseType?: 'vocab' | 'kanji' | 'grammar';
    };
  };
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen input pemilih relasional Supabase untuk mengikat item pelajaran statis ke id/slug Supabase dengan antarmuka pencarian dan pemindaian konten otomatis.
 * 
 * @param {SupabaseSelectorProps} props - Properti masukan form Sanity
 */
export function SupabaseSelector(props: SupabaseSelectorProps) {
  const { onChange, value = [], schemaType } = props;
  const supabaseType = schemaType.options?.supabaseType || 'vocab';
  const docValue = useFormValue([]) as SanityDocumentValue | null | undefined;
  const [scanning, setScanning] = useState(false);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SupabaseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          getApiUrl(`/api/admin/supabase-search?type=${supabaseType}&query=${encodeURIComponent(query)}&secret=${SECRET_TOKEN}`)
        );
        const json = await response.json();
        if (json.data) {
          setResults(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch from Supabase Bridge:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, supabaseType]);

  const handleAdd = useCallback((item: SupabaseSearchResult) => {
    // For kanji, use character. For vocab, use slug or word. For grammar, use slug or title.
    let itemValue = '';
    if (supabaseType === 'kanji') {
      itemValue = item.character || String(item.id);
    } else {
      itemValue = item.slug || item.word || item.title || String(item.id);
    }

    if (!value.includes(itemValue)) {
      const newValue = [...value, itemValue];
      onChange(newValue.length ? set(newValue) : unset());
    }

    // Reset search
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [value, onChange, supabaseType]);

  const handleRemove = useCallback((itemToRemove: string) => {
    const newValue = value.filter((v: string) => v !== itemToRemove);
    onChange(newValue.length ? set(newValue) : unset());
  }, [value, onChange]);

  const handleScanFromMateri = useCallback(async () => {
    const blocks = docValue?.content_blocks || [];
    if (blocks.length === 0) {
      alert('Tulis beberapa blok konten terlebih dahulu di tab Materi Pelajaran untuk memindai!');
      return;
    }

    setScanning(true);
    try {
      // Gather Japanese text from blocks
      let allText = '';
      blocks.forEach((b: ContentBlock) => {
        if (b.content) allText += b.content + '\n';
        if (b.title) allText += b.title + '\n';
        if (b.examples) {
          b.examples.forEach((ex) => {
            if (ex.jp) allText += ex.jp + '\n';
          });
        }
      });

      const response = await fetch(getApiUrl('/api/admin/ai-assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan-supabase',
          text: allText,
        }),
      });

      const json = await response.json();

      if (json.error) {
        alert(`Gagal: ${json.error}`);
        return;
      }

      if (json.data) {
        const scannedItems = json.data[supabaseType] || [];
        if (scannedItems.length === 0) {
          alert(`Tidak ditemukan item ${supabaseType} baru dari hasil scan.`);
          return;
        }

        const mergedValues = Array.from(new Set([...value, ...scannedItems]));
        onChange(mergedValues.length ? set(mergedValues) : unset());
        alert(`Berhasil menscan materi! Menambahkan ${scannedItems.length} item ${supabaseType} baru ke pilihan.`);
      }
    } finally {
      setScanning(false);
    }
  }, [docValue, supabaseType, value, onChange]);

  return (
    <Stack space={3}>
      <Flex justify="space-between" align="center">
        <Text size={1} weight="semibold">
          {schemaType.title || 'Supabase Items'}
        </Text>
        <Button
          fontSize={1}
          padding={2}
          mode="ghost"
          tone="positive"
          disabled={scanning}
          onClick={handleScanFromMateri}
          text={scanning ? 'Scanning...' : '🔍 Scan dari Materi'}
        />
      </Flex>
      
      {/* Selected Items badging */}
      <Flex wrap="wrap" gap={2}>
        {value.length === 0 ? (
          <Text size={1} muted style={{ fontStyle: 'italic' }}>
            Belum ada item yang dipilih. Cari di bawah untuk menambahkan.
          </Text>
        ) : (
          value.map((val: string) => (
            <Badge key={val} tone="primary" style={{ padding: '4px 8px', borderRadius: '4px' }}>
              <Flex align="center" gap={2}>
                <Text size={1} style={{ color: 'inherit' }}>{val}</Text>
                <Button
                  fontSize={1}
                  padding={0}
                  mode="bleed"
                  onClick={() => handleRemove(val)}
                  text="✕"
                  style={{ cursor: 'pointer', minWidth: 'auto' }}
                />
              </Flex>
            </Badge>
          ))
        )}
      </Flex>

      {/* Search Input wrapper */}
      <Box style={{ position: 'relative' }}>
        <TextInput
          placeholder={`Cari ${supabaseType === 'kanji' ? 'karakter/arti kanji' : supabaseType === 'vocab' ? 'kosakata/furigana' : 'tata bahasa'} dari Supabase...`}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        {loading && (
          <Flex align="center" justify="center" style={{ position: 'absolute', right: 10, top: 8 }}>
            <Spinner />
          </Flex>
        )}

        {/* Dropdown results */}
        {isOpen && (results.length > 0 || query.trim() !== '') && (
          <Card
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '4px',
              marginTop: '4px'
            }}
            padding={2}
            tone="default"
            border
          >
            {results.length === 0 ? (
              !loading && (
                <Box padding={3}>
                  <Text size={1} muted>Tidak ada hasil ditemukan.</Text>
                </Box>
              )
            ) : (
              <Stack space={1}>
                {results.map((item) => {
                  const label = supabaseType === 'kanji' 
                    ? `${item.character} - ${item.meaning}`
                    : supabaseType === 'vocab'
                      ? `${item.word} (${item.furigana || ''}) - ${item.meaning_id}`
                      : `${item.title} - ${item.meaning}`;

                  return (
                    <Card
                      key={item.id}
                      padding={2}
                      radius={2}
                      onClick={() => handleAdd(item)}
                      style={{ cursor: 'pointer' }}
                      tone="inherit"
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text size={1} weight="medium">{label}</Text>
                        </Box>
                        {item.jlpt_level && (
                          <Badge tone="caution">{item.jlpt_level}</Badge>
                        )}
                      </Flex>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Card>
        )}
      </Box>
    </Stack>
  );
}

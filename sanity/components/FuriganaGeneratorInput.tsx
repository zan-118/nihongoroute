import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Stack, Flex, Text, Button, TextArea, TextInput, Spinner, Box } from '@sanity/ui';
import { set, unset, useFormValue } from 'sanity';

import { getApiUrl } from './api';

interface FuriganaGeneratorInputProps {
  onChange: (patch: unknown) => void;
  value?: string;
  schemaType: {
    title?: string;
    name?: string;
    type?: {
      name?: string;
    };
  };
  path: import('sanity').Path;
  elementProps: Record<string, unknown>;
}

export function FuriganaGeneratorInput(props: FuriganaGeneratorInputProps) {
  const { onChange, value = '', schemaType, path, elementProps } = props;
  const [loading, setLoading] = useState(false);
  const prevSourceRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safely find sibling fields ('content', 'jp', or 'body')
  const parentPath = path.slice(0, -1);
  const siblingContent = useFormValue([...parentPath, 'content']) as string | undefined;
  const siblingJp = useFormValue([...parentPath, 'jp']) as string | undefined;
  const siblingBody = useFormValue([...parentPath, 'body']) as string | undefined;
  const sourceText = siblingContent || siblingJp || siblingBody;

  const generateFurigana = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/furigana'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      const result = await response.json();
      if (typeof result.hiragana === 'string') {
        onChange(result.hiragana ? set(result.hiragana) : unset());
      }
    } catch (err) {
      console.error('Auto-furigana failed:', err);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  // ─── AUTO-TRIGGER: Generate furigana saat sourceText berubah ────────────────
  useEffect(() => {
    // Skip jika sourceText kosong atau belum berubah
    if (!sourceText || !sourceText.trim()) return;
    if (prevSourceRef.current === sourceText) return;

    // Skip jika sudah ada furigana yang diisi manual & sourceText belum pernah di-track
    // (hindari overwrite saat pertama kali mount dengan data yang sudah ada)
    if (prevSourceRef.current === null && value) {
      prevSourceRef.current = sourceText;
      return;
    }

    prevSourceRef.current = sourceText;

    // Debounce 1.5 detik agar tidak spam API saat user masih mengetik
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateFurigana(sourceText);
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sourceText, generateFurigana, value]);

  const handleChange = useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = event.currentTarget.value;
    onChange(nextValue ? set(nextValue) : unset());
  }, [onChange]);

  const isTextArea = schemaType.type?.name === 'text' || schemaType.name === 'text';

  return (
    <Stack space={2}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={2}>
          <Text size={1} weight="semibold">
            {schemaType.title || 'Furigana'}
          </Text>
          {loading && <Spinner />}
          {loading && <Text size={0} muted>Auto-generating…</Text>}
        </Flex>
        <Button
          fontSize={0}
          padding={2}
          mode="ghost"
          tone="primary"
          disabled={loading || !sourceText?.trim()}
          onClick={() => sourceText && generateFurigana(sourceText)}
          text="🔄 Re-generate"
        />
      </Flex>

      <Box style={{ position: 'relative' }}>
        {isTextArea ? (
          <TextArea
            {...elementProps}
            value={value}
            onChange={handleChange}
            rows={3}
            placeholder="Furigana akan terisi otomatis..."
          />
        ) : (
          <TextInput
            {...elementProps}
            value={value}
            onChange={handleChange}
            placeholder="Furigana akan terisi otomatis..."
          />
        )}
        {loading && (
          <Flex
            align="center"
            justify="center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '4px',
              zIndex: 10,
            }}
          >
            <Spinner />
          </Flex>
        )}
      </Box>
    </Stack>
  );
}

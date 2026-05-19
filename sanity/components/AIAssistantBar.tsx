import React, { useState } from 'react';
import { Stack, Card, Text, TextInput, Button, Flex, Box, Spinner, Select, Label } from '@sanity/ui';
import { set, useFormValue } from 'sanity';
import { getApiUrl } from './api';

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

interface AIAssistantBarProps {
  onChange: (patches: unknown[]) => void;
}

export function AIAssistantBar(props: AIAssistantBarProps) {
  const { onChange } = props;

  // Retrieve the full document state from Sanity form
  const docValue = useFormValue([]) as SanityDocumentValue | null | undefined;

  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('N5');
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [furiganaGen, setFuriganaGen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 1. AI Auto-Generate Lesson
  const handleAutoGenerate = async () => {
    if (!topic.trim()) {
      setStatusMessage('⚠️ Silakan isi Topik / Kata Kunci pelajaran terlebih dahulu!');
      return;
    }

    setGenerating(true);
    setStatusMessage('✨ AI sedang menyusun pelajaran utuh (estimasi 20-30 detik)...');

    try {
      const response = await fetch(getApiUrl('/api/admin/ai-assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-lesson',
          topic: topic.trim(),
          level: level,
        }),
      });

      const json = await response.json();

      if (json.error) {
        setStatusMessage(`❌ Gagal: ${json.error}`);
        return;
      }

      if (json.data) {
        const { title, summary, estimated_minutes, content_blocks, quizzes, vocab_list, kanji_list, grammar_list } = json.data;

        // Apply patches to document root fields
        const patches = [];
        if (title) patches.push(set(title, ['title']));
        if (summary) patches.push(set(summary, ['summary']));
        if (estimated_minutes) patches.push(set(estimated_minutes, ['estimated_minutes']));
        if (content_blocks) patches.push(set(content_blocks, ['content_blocks']));
        if (quizzes) patches.push(set(quizzes, ['quizzes']));
        
        // Auto-scan and linking results can also be populated
        if (vocab_list && vocab_list.length > 0) patches.push(set(vocab_list, ['vocab_list']));
        if (kanji_list && kanji_list.length > 0) patches.push(set(kanji_list, ['kanji_list']));
        if (grammar_list && grammar_list.length > 0) patches.push(set(grammar_list, ['grammar_list']));

        onChange(patches);
        setStatusMessage('✅ Sukses! Seluruh pelajaran, blok konten, kuis, dan kosakata otomatis terisi.');
        setTopic('');
      }
    } catch (err: unknown) {
      console.error('Failed to auto-generate lesson:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghubungi asisten AI';
      setStatusMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setGenerating(false);
    }
  };

  // 2. Auto-Scanner & Linker Supabase
  const handleScanSupabase = async () => {
    const blocks = docValue?.content_blocks || [];
    if (blocks.length === 0) {
      setStatusMessage('⚠️ Pelajaran kosong. Tulis beberapa blok konten terlebih dahulu!');
      return;
    }

    setScanning(true);
    setStatusMessage('🔍 Menscan teks pelajaran & mencocokkan ke database Supabase...');

    try {
      // Gather all Japanese text from blocks
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
        setStatusMessage(`❌ Gagal: ${json.error}`);
        return;
      }

      if (json.data) {
        const { vocab, kanji, grammar } = json.data;

        // Apply patches to reference arrays
        const patches = [];
        if (vocab && vocab.length > 0) patches.push(set(vocab, ['vocab_list']));
        if (kanji && kanji.length > 0) patches.push(set(kanji, ['kanji_list']));
        if (grammar && grammar.length > 0) patches.push(set(grammar, ['grammar_list']));

        onChange(patches);
        setStatusMessage(`✅ Scan berhasil! Dihubungkan otomatis: ${vocab?.length || 0} kosakata, ${kanji?.length || 0} kanji, ${grammar?.length || 0} tata bahasa.`);
      }
    } catch (err: unknown) {
      console.error('Failed to scan database:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal menscan database';
      setStatusMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setScanning(false);
    }
  };

  // 3. Auto-Generator Furigana
  const handleGenerateFurigana = async () => {
    const blocks = docValue?.content_blocks || [];
    const blocksWithText = blocks.filter((b: ContentBlock) => b.content && !b.furigana);

    if (blocksWithText.length === 0) {
      setStatusMessage('💡 Semua blok konten Jepang sudah memiliki Furigana!');
      return;
    }

    setFuriganaGen(true);
    setStatusMessage('✍️ Menganalisis kalimat Jepang & memformulasikan Furigana...');

    try {
      const textToConvert = blocksWithText.map((b: ContentBlock) => b.content).join('\n');

      const response = await fetch(getApiUrl('/api/admin/ai-assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-furigana',
          text: textToConvert,
        }),
      });

      const json = await response.json();

      if (json.error) {
        setStatusMessage(`❌ Gagal: ${json.error}`);
        return;
      }

      if (json.data) {
        const furiganaLines = json.data.split('\n');

        // Map furigana lines back to their corresponding blocks
        let linesIdx = 0;
        const updatedBlocks = blocks.map((b: ContentBlock) => {
          if (b.content && !b.furigana && linesIdx < furiganaLines.length) {
            const f = furiganaLines[linesIdx].trim();
            linesIdx++;
            return { ...b, furigana: f };
          }
          return b;
        });

        onChange([set(updatedBlocks, ['content_blocks'])]);
        setStatusMessage('✅ Sukses melengkapi seluruh Furigana otomatis!');
      }
    } catch (err: unknown) {
      console.error('Failed to generate Furigana:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal men-generate furigana';
      setStatusMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setFuriganaGen(false);
    }
  };

  return (
    <Card padding={4} radius={3} tone="caution" border style={{ background: 'rgba(var(--primary-rgb), 0.03)' }}>
      <Stack space={4}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text size={2} weight="bold">✨ NihongoRoute AI Assistant Command Center</Text>
            <Text size={1} muted style={{ marginTop: '4px' }}>
              Asisten premium pembuat kurikulum terintegrasi dengan database Supabase & AI Gemini
            </Text>
          </Box>
        </Flex>

        {/* Status indicator banner */}
        {statusMessage && (
          <Card padding={3} radius={2} tone="default" border>
            <Text size={1} weight="medium">{statusMessage}</Text>
          </Card>
        )}

        <Stack space={3}>
          {/* SECTION 1: AI Auto-Generator */}
          <Card padding={3} radius={2} border tone="inherit">
            <Stack space={3}>
              <Label size={1} weight="bold">1. AI Auto-Generate Pelajaran Utuh</Label>
              <Flex gap={2}>
                <Box flex={3}>
                  <TextInput
                    placeholder="Masukkan topik (misal: Pola Kalimat '~te kudasai' atau 'Waktu & Hari N5')"
                    value={topic}
                    onChange={(e) => setTopic(e.currentTarget.value)}
                    disabled={generating}
                  />
                </Box>
                <Box flex={1}>
                  <Select value={level} onChange={(e) => setLevel(e.currentTarget.value)} disabled={generating}>
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </Select>
                </Box>
                <Button
                  tone="primary"
                  onClick={handleAutoGenerate}
                  disabled={generating || scanning || furiganaGen}
                  text={generating ? 'Generating...' : '✨ Generate'}
                />
              </Flex>
            </Stack>
          </Card>

          {/* SECTION 2 & 3: Database Scan & Furigana Tool */}
          <Flex gap={3}>
            <Card padding={3} radius={2} border style={{ flex: 1 }}>
              <Stack space={3}>
                <Label size={1} weight="bold">2. Scan database & Hubungkan</Label>
                <Text size={1} muted>Menganalisis teks pelajaran & langsung memetakan Kosakata/Kanji/Grammar dari Supabase.</Text>
                <Button
                  tone="positive"
                  onClick={handleScanSupabase}
                  disabled={generating || scanning || furiganaGen}
                  text={scanning ? 'Scanning...' : '🔍 Scan & Hubungkan'}
                  style={{ width: '100%' }}
                />
              </Stack>
            </Card>

            <Card padding={3} radius={2} border style={{ flex: 1 }}>
              <Stack space={3}>
                <Label size={1} weight="bold">3. Auto-Generator Furigana</Label>
                <Text size={1} muted>Menyaring seluruh kalimat Jepang dalam pelajaran dan melengkapi Furigana yang kosong.</Text>
                <Button
                  tone="caution"
                  onClick={handleGenerateFurigana}
                  disabled={generating || scanning || furiganaGen}
                  text={furiganaGen ? 'Converting...' : '✍️ Generate Furigana'}
                  style={{ width: '100%' }}
                />
              </Stack>
            </Card>
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}
